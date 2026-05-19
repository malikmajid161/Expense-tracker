import os
import json
import uuid
import random
import datetime
import functions_framework
from google.cloud import storage
from google.cloud import pubsub_v1

@functions_framework.http
def port_scraper(request):
    """
    HTTP Cloud Function triggered by Cloud Scheduler.
    1. Simulates Geospatial Port Congestion feed for Karachi, Gwadar, and Shanghai.
    2. Randomizes values slightly to feel alive, but Karachi is set as congested to trigger simulated alerts.
    3. Saves full JSON telemetry to Cloud Storage.
    4. If congestion > 7.0, publishes an incident to Pub/Sub for automatic mitigation.
    """
    try:
        # Lazy initialize clients to keep health check fast
        storage_client = storage.Client()
        publisher = pubsub_v1.PublisherClient()

        # Auto-detect GCP environment variables
        PROJECT_ID = os.environ.get('GCP_PROJECT') or 'chaingaurd-ai'
        TOPIC_ID = 'chaingaurd-incident-detected'
        TOPIC_PATH = publisher.topic_path(PROJECT_ID, TOPIC_ID)
        BUCKET_NAME = f"chaingaurd-raw-data-{PROJECT_ID}"

        # Generate mock telemetry for the 3 key trade ports
        # Karachi (simulating a labor strike or severe seasonal backlog)
        karachi_congestion = round(random.uniform(7.5, 9.2), 1)
        # Gwadar (newer port, relatively clear)
        gwadar_congestion = round(random.uniform(2.0, 4.5), 1)
        # Shanghai (major origin hub, moderately busy)
        shanghai_congestion = round(random.uniform(4.0, 6.5), 1)

        ports_data = [
            {
                "port_name": "Karachi",
                "lat": 24.86,
                "lng": 66.97,
                "congestion_level": karachi_congestion,
                "turnaround_time_hours": int(karachi_congestion * 6.5),
                "ships_waiting": int(karachi_congestion * 3),
                "status": "CLOSED" if karachi_congestion > 9.0 else "CONGESTED",
                "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
            },
            {
                "port_name": "Gwadar",
                "lat": 25.12,
                "lng": 62.32,
                "congestion_level": gwadar_congestion,
                "turnaround_time_hours": int(gwadar_congestion * 4.0),
                "ships_waiting": int(gwadar_congestion * 1.5),
                "status": "NORMAL",
                "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
            },
            {
                "port_name": "Shanghai",
                "lat": 31.23,
                "lng": 121.47,
                "congestion_level": shanghai_congestion,
                "turnaround_time_hours": int(shanghai_congestion * 4.8),
                "ships_waiting": int(shanghai_congestion * 4),
                "status": "CONGESTED" if shanghai_congestion > 6.0 else "NORMAL",
                "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
            }
        ]

        # Backup data to GCS
        now = datetime.datetime.utcnow()
        time_folder = now.strftime('%Y-%m-%d')
        time_file = now.strftime('%H-%M-%S')
        gcs_filename = f"ports/{time_folder}/{time_file}_ports.json"
        
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_filename)
        blob.upload_from_string(
            json.dumps(ports_data, indent=2),
            content_type='application/json'
        )
        print(f"✅ Port telemetry saved to GCS: gs://{BUCKET_NAME}/{gcs_filename}")

        # Check for alerts (Karachi is guaranteed to trigger based on above range)
        published_count = 0
        for port in ports_data:
            if port["congestion_level"] > 7.0 or port["status"] == "CLOSED":
                incident_id = str(uuid.uuid4())
                payload = {
                    "incident_id": incident_id,
                    "source": "port",
                    "title": f"CRITICAL: Severe {port['status']} Alert at {port['port_name']} Port",
                    "url": f"https://storage.googleapis.com/{BUCKET_NAME}/{gcs_filename}",
                    "risk_score": float(port["congestion_level"] / 10.0),
                    "raw_text": f"Geospatial alert triggered. Port: {port['port_name']} shows {port['ships_waiting']} ships waiting. Turnaround time extended to {port['turnaround_time_hours']} hours. Status: {port['status']}.",
                    "detected_at": now.isoformat() + "Z",
                    "gcs_path": f"gs://{BUCKET_NAME}/{gcs_filename}"
                }
                
                # Publish to Pub/Sub
                data_str = json.dumps(payload)
                future = publisher.publish(TOPIC_PATH, data_str.encode('utf-8'))
                message_id = future.result()
                published_count += 1
                print(f"🔥 Port Backlog Incident dispatched to Pub/Sub. ID: {message_id} | Port: {port['port_name']}")

        response_body = {
            "status": "SUCCESS",
            "ports_monitored": len(ports_data),
            "incidents_published": published_count,
            "gcs_path": f"gs://{BUCKET_NAME}/{gcs_filename}"
        }
        return (
            json.dumps(response_body),
            200,
            {"Content-Type": "application/json"}
        )

    except Exception as e:
        import traceback
        err_msg = f"Fatal error in port scraper function: {e}\n{traceback.format_exc()}"
        print(err_msg)
        return (
            json.dumps({"status": "FAILED", "error": str(e)}),
            500,
            {"Content-Type": "application/json"}
        )
