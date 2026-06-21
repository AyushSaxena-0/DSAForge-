import urllib.request
import json
import re
import datetime
from sqlalchemy.orm import Session
from app import models, schemas

# Custom mappings (identical to importer.py)
CUSTOM_LEETCODE_MAPPING = [
    {
        "keywords": ["print the sum of both", "sum of two numbers", "sum of 2 numbers", "sum_of_two_numbers"],
        "number": "2235",
        "title": "Add Two Integers",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/add-two-integers/"
    },
    {
        "keywords": ["fibonacci series", "fibonacci number", "fibonacci"],
        "number": "509",
        "title": "Fibonacci Number",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/fibonacci-number/"
    },
    {
        "keywords": ["string is palindrome", "palindrome string"],
        "number": "125",
        "title": "Valid Palindrome",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/valid-palindrome/"
    },
    {
        "keywords": ["palindrome number"],
        "number": "9",
        "title": "Palindrome Number",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/palindrome-number/"
    },
    {
        "keywords": ["armstrong number", "armstrongnumbers"],
        "number": "1134",
        "title": "Armstrong Number",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/armstrong-number/"
    },
    {
        "keywords": ["hcf and lcm", "find gcd", "hcf of two numbers", "greatest common divisor"],
        "number": "1979",
        "title": "Find Greatest Common Divisor of Array",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/find-greatest-common-divisor-of-array/"
    },
    {
        "keywords": ["smallest even multiple", "lcm of two numbers"],
        "number": "2413",
        "title": "Smallest Even Multiple",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/smallest-even-multiple/"
    },
    {
        "keywords": ["reverse a string", "reverse string"],
        "number": "344",
        "title": "Reverse String",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/reverse-string/"
    },
    {
        "keywords": ["operator (+, -, *, /)", "basic calculator", "calculator"],
        "number": "227",
        "title": "Basic Calculator II",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/basic-calculator-ii/"
    },
    {
        "keywords": ["factors of a number", "kth factor"],
        "number": "1492",
        "title": "The kth Factor of n",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/the-kth-factor-of-n/"
    },
    {
        "keywords": ["reverse a number", "reverse number", "reverse integer"],
        "number": "7",
        "title": "Reverse Integer",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/reverse-integer/"
    },
    {
        "keywords": ["prime number"],
        "number": "204",
        "title": "Count Primes",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/count-primes/"
    }
]

def clean_string(s):
    if not s:
        return set()
    s_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', s.lower())
    words = s_clean.split()
    stop_words = {
        'to', 'and', 'the', 'of', 'a', 'in', 'an', 'whether', 'it', 'is', 'or', 'not', 
        'take', 'input', 'print', 'write', 'program', 'user', 'from', 'java', 'leetcode', 
        'gfg', 'hots1', 'approach', 'concept', 'problem', 'run'
    }
    return {w for w in words if w not in stop_words and len(w) > 1}

def get_filename_only(path):
    fname = path.split('/')[-1]
    if fname.endswith('.java'):
        fname = fname[:-5]
    return fname

def sync_github_progress(db: Session, github_username: str = "AyushSaxena-0", repo_name: str = "DSA"):
    # 1. Fetch DB problems
    db_problems = db.query(models.Problem).all()
    
    db_problems_list = []
    for p in db_problems:
        db_problems_list.append({
            'model': p,
            'leetcode_number': p.leetcode_number,
            'problem_name': p.problem_name,
            'words': clean_string(p.problem_name)
        })
        
    # 2. Fetch Git Repo files
    url = f"https://api.github.com/repos/{github_username}/{repo_name}/git/trees/master?recursive=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            tree = data.get('tree', [])
            java_files = [x['path'] for x in tree if x['type'] == 'blob' and x['path'].endswith('.java')]
    except Exception as e:
        print("Error fetching repo:", e)
        return 0, f"Error fetching GitHub repository: {str(e)}"
        
    synced_count = 0
    today_str = datetime.date.today().isoformat()
    
    problems_to_complete = []
    
    for path in java_files:
        fname = get_filename_only(path)
        
        # Strategy 1: Match by LeetCode ID
        lc_match = re.search(r'[lL]eet[cC]ode[_-]?(\d+)', fname)
        if lc_match:
            lc_num = lc_match.group(1)
            db_matches = [p for p in db_problems_list if p['leetcode_number'] == lc_num]
            if db_matches:
                for db_m in db_matches:
                    problems_to_complete.append(db_m['model'])
                continue
            else:
                continue
                
        # Strategy 2: Match by Custom Mapping Keywords
        matched_by_custom = False
        fname_words = clean_string(fname)
        for mapping in CUSTOM_LEETCODE_MAPPING:
            for kw in mapping["keywords"]:
                kw_set = clean_string(kw)
                if kw_set and kw_set.issubset(fname_words):
                    lc_num = mapping["number"]
                    db_matches = [p for p in db_problems_list if p['leetcode_number'] == lc_num]
                    if db_matches:
                        for db_m in db_matches:
                            problems_to_complete.append(db_m['model'])
                        matched_by_custom = True
                        break
            if matched_by_custom:
                break
        if matched_by_custom:
            continue
            
        # Strategy 3: Clean Name Keyword Intersection Match
        cleaned_name = re.sub(r'^(O\d+|DP_\d+|HOTS\d+)', '', fname)
        cleaned_name_words = clean_string(cleaned_name)
        
        best_db_match = None
        best_intersection_len = 0
        best_match_ratio = 0.0
        
        if cleaned_name_words:
            for p in db_problems_list:
                intersection = cleaned_name_words.intersection(p['words'])
                if intersection:
                    ratio = len(intersection) / len(p['words']) if len(p['words']) > 0 else 0
                    if len(intersection) > best_intersection_len or (len(intersection) == best_intersection_len and ratio > best_match_ratio):
                        best_intersection_len = len(intersection)
                        best_match_ratio = ratio
                        best_db_match = p
                        
        if best_db_match:
            is_lc = best_db_match['leetcode_number'] != 'NA'
            threshold = 3 if is_lc else 2
            if best_intersection_len >= threshold:
                problems_to_complete.append(best_db_match['model'])
                
    # Update matched problems in DB
    for db_p in problems_to_complete:
        if not db_p.completed:
            db_p.completed = True
            db_p.date_solved = today_str
            synced_count += 1
            
    db.commit()
    return synced_count, "Success"
