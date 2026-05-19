import os
import json
import uuid
import re
import datetime
import functions_framework
from google.cloud import storage
from google.cloud import pubsub_v1
from google.cloud import vision

# Regular expressions for keyword and values extraction
CIRCULAR_REGEX = re.compile(r"(?:circular|circular\s*no|c\.no|c\.no\.)\s*([0-9a-zA-Z\(\)\/\-\._]+)", re.IGNORECASE)
DUTY_REGEX = re.compile(r"(\d+(?:\.\d+)?)\s*%\s*(?:regulatory\s*duty|duty|tax|tariff)", re.IGNORECASE)
EFFECTIVE_DATE_REGEX = re.compile(r"effective(?:\s*from|\s*date)?\s*([0-9a-zA-Z,\s]+(?:midnight|202\d))", re.IGNORECASE)

MATERIALS_LIST = ["lithium battery", "pcb board", "microcontroller", "steel", "aluminum", "copper", "sensor", "capacitor"]

@functions_framework.http
def policy_parser(request):
    """
    HTTP POST Cloud Function triggered by Document Upload.
    1. Accepts multipart/form-data containing PDF or Image.
    2. Performs OCR text extraction via Google Cloud Vision API.
    3. Runs standard regex parsing to extract key fields (duty rates, effective dates, affected materials).
    4. Backs up extracted JSON schema to GCS contracts bucket.
    5. If duty rate increase > 5%, dispatches an alert to Pub/Sub.
    """
    try:
        # Lazy initialize GCP clients
        storage_client = storage.Client()
        publisher = pubsub_v1.PublisherClient()
        vision_client = vision.ImageAnnotatorClient()

        # Auto-detect GCP environment variables
        PROJECT_ID = os.environ.get('GCP_PROJECT') or 'chaingaurd-ai'
        TOPIC_ID = 'chaingaurd-incident-detected'
        TOPIC_PATH = publisher.topic_path(PROJECT_ID, TOPIC_ID)
        BUCKET_NAME = f"chaingaurd-contracts-{PROJECT_ID}"
        RAW_BUCKET_NAME = f"chaingaurd-raw-data-{PROJECT_ID}"

        extracted_text = ""
        filename = "mock_policy.pdf"
        
        # Check if it's a real file upload or simulated request
        is_mock = request.args.get('mock') == 'true' or request.method == 'GET'
        
        if is_mock or not request.files:
            print("ℹ️ Mock Policy Parser mode activated (Sandbox environment).")
            # Build the exact FBR P0 Policy Circular for Lithum & PCB components
            extracted_text = (
                "GOVERNMENT OF PAKISTAN\n"
                "FEDERAL BOARD OF REVENUE\n"
                "Islamabad, May 18, 2026\n\n"
                "CIRCULAR C.No.1(2)Valuation/2026/89\n"
                "SUBJECT: IMPLEMENTATION OF REGULATORY DUTY ON IMPORTED ELECTRONIC COMPONENTS\n\n"
                "The Federal Board of Revenue is pleased to announce a 15.0% regulatory duty "
                "on lithium batteries, PCB boards, and microcontrollers imported into Pakistan. "
                "This measures are taken to support local manufacturing and stabilize reserves. "
                "The circular shall be effective from midnight tonight, May 19, 2026."
            )
        else:
            # Real file processing
            uploaded_file = next(iter(request.files.values()))
            filename = uploaded_file.filename
            file_bytes = uploaded_file.read()
            
            # Save raw document backup to raw data bucket
            raw_gcs_bucket = storage_client.bucket(RAW_BUCKET_NAME)
            raw_blob = raw_gcs_bucket.blob(f"uploads/{uuid.uuid4()}_{filename}")
            raw_blob.upload_from_string(file_bytes, content_type=uploaded_file.content_type)
            print(f"✅ Raw uploaded file backed up to: gs://{RAW_BUCKET_NAME}/{raw_blob.name}")
            
            # OCR using Google Cloud Vision API
            print(f"Running Google Vision OCR on {filename}...")
            image = vision.Image(content=file_bytes)
            ocr_response = vision_client.text_detection(image=image)
            annotations = ocr_response.text_annotations
            
            if annotations:
                extracted_text = annotations[0].description
            else:
                extracted_text = "Vision OCR returned no text. Ensure file is not corrupt or empty."

        # Parse extracted text to identify metadata
        circular_match = CIRCULAR_REGEX.search(extracted_text)
        duty_match = DUTY_REGEX.search(extracted_text)
        date_match = EFFECTIVE_DATE_REGEX.search(extracted_text)

        circular_number = circular_match.group(1) if circular_match else "UNKNOWN-CIRCULAR"
        duty_rate = float(duty_match.group(1)) if duty_match else 0.0
        effective_date = date_match.group(1).strip() if date_match else "IMMEDIATE"

        # Identify affected materials
        affected_materials = []
        text_lower = extracted_text.lower()
        for material in MATERIALS_LIST:
            if material in text_lower:
                affected_materials.append(material.title())

        # Build standard structured JSON response
        now = datetime.datetime.utcnow()
        parsed_metadata = {
            "parser_version": "v1.0.0",
            "circular_number": circular_number,
            "regulatory_body": "Federal Board of Revenue (FBR)",
            "affected_materials": affected_materials if affected_materials else ["Electronic Components"],
            "duty_increase_rate": duty_rate,
            "effective_date": effective_date,
            "full_text": extracted_text,
            "parsed_at": now.isoformat() + "Z"
        }

        # Backup structured schema to Contracts GCS Bucket
        time_folder = now.strftime('%Y-%m-%d')
        time_file = now.strftime('%H-%M-%S')
        gcs_filename = f"policies/{time_folder}/{time_file}_parsed_policy.json"
        
        contracts_bucket = storage_client.bucket(BUCKET_NAME)
        blob = contracts_bucket.blob(gcs_filename)
        blob.upload_from_string(
            json.dumps(parsed_metadata, indent=2),
            content_type='application/json'
        )
        print(f"✅ Parsed policy metadata saved to GCS: gs://{BUCKET_NAME}/{gcs_filename}")

        # If duty rate increase > 5%, dispatch alert to Pub/Sub
        published_incident = False
        if duty_rate > 5.0:
            incident_id = str(uuid.uuid4())
            payload = {
                "incident_id": incident_id,
                "source": "ocr_parser",
                "title": f"FBR POLICY HIKED: {duty_rate}% Regulatory Duty Circular {circular_number}",
                "url": f"https://storage.googleapis.com/{BUCKET_NAME}/{gcs_filename}",
                "risk_score": float(duty_rate / 100.0),
                "raw_text": f"Circular {circular_number} released by FBR imposes emergency regulatory duty of {duty_rate}% on {', '.join(affected_materials)}. Effective: {effective_date}.",
                "detected_at": now.isoformat() + "Z",
                "gcs_path": f"gs://{BUCKET_NAME}/{gcs_filename}"
            }
            
            # Publish to Pub/Sub
            data_str = json.dumps(payload)
            future = publisher.publish(TOPIC_PATH, data_str.encode('utf-8'))
            message_id = future.result()
            published_incident = True
            print(f"🔥 Regulatory Policy Incident dispatched to Pub/Sub. ID: {message_id} | Duty Rate: {duty_rate}%")

        response_body = {
            "status": "SUCCESS",
            "circular_number": circular_number,
            "duty_rate": duty_rate,
            "effective_date": effective_date,
            "materials_affected": affected_materials,
            "pubsub_published": published_incident,
            "gcs_path": f"gs://{BUCKET_NAME}/{gcs_filename}"
        }
        return (
            json.dumps(response_body),
            200,
            {"Content-Type": "application/json"}
        )

    except Exception as e:
        import traceback
        err_msg = f"Fatal error in policy parser function: {e}\n{traceback.format_exc()}"
        print(err_msg)
        return (
            json.dumps({"status": "FAILED", "error": str(e)}),
            500,
            {"Content-Type": "application/json"}
        )
