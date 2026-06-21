import urllib.request
import json
import re

files_to_check = [
    "O4Sum_Of_Two_Numbers.java",
    "O8TemperatureConversion.java",
    "O9Conditionals.java",
    "O12Fibonacci.java",
    "O13Counting_Occurrence_Of_A_Digit.java",
    "O14Reverse_Number.java",
    "O23Greeting.java",
    "O25Prime_Number.java",
    "O26Armstrong_Number.java",
    "O33ArmstrongNumbers.java"
]

print("Scanning user's repo files for LeetCode mappings...")

for fname in files_to_check:
    url = f"https://raw.githubusercontent.com/AyushSaxena-0/DSA/master/src/{fname}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            # Look for leetcode keyword or numbers
            lc_matches = re.findall(r'(leetcode|problem|leetcode\.com/problems/[a-z0-9-]+)', content, re.IGNORECASE)
            print(f"\nFile: {fname}")
            if lc_matches:
                print("  Matches found:", lc_matches)
                # Print lines containing matches
                lines = content.split('\n')
                for line in lines:
                    if any(x.lower() in line.lower() for x in ['leetcode', 'problem']):
                        print(f"    Line: {line.strip()}")
            else:
                print("  No LeetCode tags found. First 10 lines:")
                lines = content.split('\n')
                for line in lines[:10]:
                    if line.strip():
                        print(f"    {line.strip()}")
    except Exception as e:
        print(f"Error checking {fname}: {e}")
