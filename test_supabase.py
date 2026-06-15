import urllib.request
import urllib.parse
import json
import uuid

url = 'https://ppiyecfcjpdajnpfrsyg.supabase.co/auth/v1/signup'
headers = {
    'apikey': 'sb_publishable_-fQ56EziX2yWdSBwZQU3Ag_iutcKnoZ',
    'Content-Type': 'application/json'
}
data = json.dumps({'email': f'test_{uuid.uuid4()}@example.com', 'password': 'testpassword'}).encode('utf-8')

try:
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req) as response:
        print("Success!", response.status)
        print(response.read().decode())
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
