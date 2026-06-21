import urllib.request
import json

url = "https://api.github.com/repos/AyushSaxena-0/DSA/contents/src/com/Ayush"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as response:
        items = json.loads(response.read().decode('utf-8'))
        for item in items:
            print(f"{item['type']}: {item['name']} - {item['html_url']}")
except Exception as e:
    print("Error:", e)
