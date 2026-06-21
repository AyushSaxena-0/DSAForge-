import urllib.request
import json
import re
import sys
import os

# Adjust path to import models and database if running as main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app import models

def clean_topic_name(step_title: str) -> str:
    title_lower = step_title.lower().strip()
    if "binary search tree" in title_lower or "bst" in title_lower:
        return "BST"
    elif "binary tree" in title_lower:
        return "Binary Trees"
    elif "binary search" in title_lower:
        return "Binary Search"
    elif "linkedlist" in title_lower or "linked list" in title_lower:
        return "LinkedList"
    elif "recursion" in title_lower:
        return "Recursion"
    elif "stack" in title_lower or "queue" in title_lower:
        return "Stack & Queue"
    elif "sliding window" in title_lower or "two pointer" in title_lower:
        return "Sliding Window & Two Pointer"
    elif "greedy" in title_lower:
        return "Greedy"
    elif "heap" in title_lower:
        return "Heaps"
    elif "sorting" in title_lower:
        return "Sorting"
    elif "graph" in title_lower:
        return "Graphs"
    elif "dynamic programming" in title_lower or "dp" in title_lower:
        return "Dynamic Programming"
    elif "string" in title_lower:
        return "Strings"
    elif "bitwise" in title_lower or "bit manipulation" in title_lower:
        return "Bit Manipulation"
    elif "basics" in title_lower:
        return "Basics"
    elif "array" in title_lower:
        return "Arrays"
    elif "trie" in title_lower:
        return "Tries"
    return step_title.title()

def fetch_leetcode_database():
    print("Fetching LeetCode problem database...")
    leetcode_map = {}
    try:
        url = "https://leetcode.com/api/problems/algorithms/"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            pairs = data.get("stat_status_pairs", [])
            print(f"Fetched {len(pairs)} LeetCode problems metadata.")
            for p in pairs:
                stat = p.get("stat", {})
                slug = stat.get("question__title_slug")
                qid = stat.get("frontend_question_id")
                title = stat.get("question__title")
                lvl = p.get("difficulty", {}).get("level", 1)
                diff = {1: "Easy", 2: "Medium", 3: "Hard"}.get(lvl, "Easy")
                if slug:
                    leetcode_map[slug] = {
                        "question_id": qid,
                        "title": title,
                        "difficulty": diff
                    }
    except Exception as e:
        print("Could not fetch LeetCode database:", e)
    return leetcode_map

def run_importer(db=None):
    close_db_on_exit = False
    if db is None:
        db = SessionLocal()
        close_db_on_exit = True

    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    leetcode_map = fetch_leetcode_database()
    
    print("Downloading curated DSA curriculum sheet...")
    url = "https://raw.githubusercontent.com/hitarth-gg/CP/main/striver-a2z.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            curriculum_data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print("Error downloading curriculum sheet:", e)
        if close_db_on_exit:
            db.close()
        return 0, 0, f"Error downloading curriculum sheet: {e}"
        
    print("Clearing old problems database...")
    db.query(models.Problem).delete()
    db.commit()
    
    problems_to_import = []
    
    for step in curriculum_data:
        step_title = step.get("step_title", "Unknown")
        topic = clean_topic_name(step_title)
        step_no = step.get("step_no", 1)
        assignment_file = f"{step_no:02d}-{topic.lower().replace(' ', '-')}.md"
        
        for sub_step in step.get("sub_steps", []):
            for t in sub_step.get("topics", []):
                question_title = t.get("question_title", "").strip()
                lc_link = t.get("lc_link")
                difficulty_num = t.get("difficulty", 0)
                
                lc_num = "NA"
                lc_diff = "Easy" if difficulty_num == 0 else "Medium" if difficulty_num == 1 else "Hard" if difficulty_num == 2 else "NA"
                lc_title = question_title
                link_url = lc_link or ""
                
                if lc_link:
                    slug_match = re.search(r'leetcode\.com/problems/([^/#\s\?]+)', lc_link)
                    if slug_match:
                        slug = slug_match.group(1).lower().strip()
                        if slug in leetcode_map:
                            lc_num = str(leetcode_map[slug]["question_id"])
                            lc_diff = leetcode_map[slug]["difficulty"]
                            lc_title = leetcode_map[slug]["title"]
                            link_url = f"https://leetcode.com/problems/{slug}/"
                            
                problems_to_import.append(
                    models.Problem(
                        topic=topic,
                        problem_name=lc_title,
                        leetcode_number=lc_num,
                        difficulty=lc_diff,
                        direct_url=link_url,
                        assignment_file=assignment_file,
                        completed=False,
                        revision_count=0,
                        notes="",
                        date_solved=None,
                        is_top_250=False
                    )
                )
                
    print(f"Importing {len(problems_to_import)} curated problems...")
    db.bulk_save_objects(problems_to_import)
    db.commit()
    
    # Target counts per topic. Must sum to exactly 250.
    target_counts = {
        'Basics': 12,
        'Sorting': 7,
        'Arrays': 24,
        'Binary Search': 22,
        'Strings': 12,
        'LinkedList': 20,
        'Recursion': 15,
        'Bit Manipulation': 10,
        'Stack & Queue': 18,
        'Sliding Window & Two Pointer': 10,
        'Heaps': 10,
        'Greedy': 10,
        'Binary Trees': 20,
        'BST': 10,
        'Graphs': 16,
        'Dynamic Programming': 29,
        'Tries': 5
    }
    
    # Retrieve all imported problems to assign is_top_250
    all_imported = db.query(models.Problem).all()
    selected_ids = []
    
    # Group by topic
    grouped = {}
    for p in all_imported:
        if p.topic not in grouped:
            grouped[p.topic] = []
        grouped[p.topic].append(p)
        
    for topic_name, target in target_counts.items():
        if topic_name not in grouped:
            print(f"Warning: Topic {topic_name} not found in imported dataset.")
            continue
        problems = sorted(grouped[topic_name], key=lambda x: x.id)
        total = len(problems)
        
        if total <= target:
            for p in problems:
                selected_ids.append(p.id)
        else:
            for i in range(target):
                idx = int(i * (total - 1) / (target - 1))
                selected_ids.append(problems[idx].id)
                
    # Update is_top_250 in DB
    db.query(models.Problem).filter(models.Problem.id.in_(selected_ids)).update({models.Problem.is_top_250: True}, synchronize_session=False)
    db.commit()
    
    if close_db_on_exit:
        db.close()
        
    return len(problems_to_import), 0, "Success"

if __name__ == "__main__":
    run_importer()
