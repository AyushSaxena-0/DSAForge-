import urllib.request
import json
import re

url = "https://api.github.com/repos/AyushSaxena-0/DSA/contents/src"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as response:
        items = json.loads(response.read().decode('utf-8'))
        
        # Sort items to inspect systematically
        files = [i for i in items if i['type'] == 'file']
        dirs = [i for i in items if i['type'] == 'dir']
        
        print(f"Total files in src: {len(files)}")
        print(f"Total dirs in src: {len(dirs)}")
        
        # Print files matching initial topics
        keywords = ['leap', 'sum', 'odd', 'even', 'greeting', 'interest', 'calculator', 'largest', 'rupee', 'usd', 'fibonacci', 'palindrome', 'armstrong', 'area', 'perimeter', 'volume', 'leetcode']
        
        matched_files = []
        for f in files:
            name_lower = f['name'].lower()
            if any(k in name_lower for k in keywords):
                matched_files.append(f)
                
        print(f"\nMatched files count: {len(matched_files)}")
        for mf in matched_files:
            print(f"- {mf['name']}: {mf['download_url']}")
            
except Exception as e:
    print("Error:", e)
