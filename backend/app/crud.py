from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
import datetime

def get_problems(
    db: Session,
    topic: str = None,
    difficulty: str = None,
    completed: bool = None,
    search: str = None,
    top_250: bool = None
):
    query = db.query(models.Problem)
    if topic:
        query = query.filter(models.Problem.topic == topic)
    if difficulty:
        query = query.filter(models.Problem.difficulty == difficulty)
    if completed is not None:
        query = query.filter(models.Problem.completed == completed)
    if search:
        query = query.filter(models.Problem.problem_name.ilike(f"%{search}%"))
    if top_250 is not None:
        query = query.filter(models.Problem.is_top_250 == top_250)
    
    # Sort logically: e.g. put LeetCode questions first or sorting by id
    return query.order_by(models.Problem.id).all()


def get_problem(db: Session, problem_id: int):
    return db.query(models.Problem).filter(models.Problem.id == problem_id).first()

def update_problem(db: Session, problem_id: int, problem_update: schemas.ProblemUpdate):
    db_problem = get_problem(db, problem_id)
    if not db_problem:
        return None
    
    update_data = problem_update.model_dump(exclude_unset=True)
    
    # Handle completed and date_solved interaction
    if "completed" in update_data:
        is_completed = update_data["completed"]
        db_problem.completed = is_completed
        if is_completed:
            # Only set date_solved if not already set
            if not db_problem.date_solved:
                db_problem.date_solved = update_data.get("date_solved") or datetime.date.today().isoformat()
        else:
            db_problem.date_solved = None
            
    for key, value in update_data.items():
        if key != "completed":
            setattr(db_problem, key, value)
            
    db.commit()
    db.refresh(db_problem)
    return db_problem

def bulk_import_problems(db: Session, problems: list[schemas.ProblemCreate]):
    imported_count = 0
    updated_count = 0
    
    # Build unique keys of existing problems to avoid duplicates and retain progress
    # Unique key can be combination of problem_name and assignment_file
    existing_problems = db.query(models.Problem).all()
    existing_map = {
        (p.problem_name.lower().strip(), p.assignment_file): p
        for p in existing_problems
    }
    
    for p_schema in problems:
        key = (p_schema.problem_name.lower().strip(), p_schema.assignment_file)
        if key in existing_map:
            # Problem exists. Update fields if necessary, but PRESERVE user progress (completed, notes, etc.)
            db_p = existing_map[key]
            # Update source details in case they changed
            db_p.leetcode_number = p_schema.leetcode_number
            db_p.difficulty = p_schema.difficulty
            db_p.direct_url = p_schema.direct_url
            db_p.topic = p_schema.topic
            updated_count += 1
        else:
            # Create new problem
            db_p = models.Problem(
                topic=p_schema.topic,
                problem_name=p_schema.problem_name,
                leetcode_number=p_schema.leetcode_number,
                difficulty=p_schema.difficulty,
                direct_url=p_schema.direct_url,
                assignment_file=p_schema.assignment_file,
                completed=False,
                revision_count=0,
                notes="",
                date_solved=None
            )
            db.add(db_p)
            imported_count += 1
            
    db.commit()
    return imported_count, updated_count

def calculate_streaks(dates: list[datetime.date]) -> tuple[int, int]:
    """
    Calculate current streak and longest streak from a list of unique sorted dates.
    """
    if not dates:
        return 0, 0
        
    sorted_dates = sorted(list(set(dates)))
    
    longest_streak = 0
    current_streak = 0
    
    # Calculate longest streak
    temp_streak = 1
    for i in range(1, len(sorted_dates)):
        diff = (sorted_dates[i] - sorted_dates[i-1]).days
        if diff == 1:
            temp_streak += 1
        elif diff > 1:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
    longest_streak = max(longest_streak, temp_streak)
    
    # Calculate current streak
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    
    last_date = sorted_dates[-1]
    if last_date == today or last_date == yesterday:
        current_streak = 1
        # Walk backwards
        for i in range(len(sorted_dates) - 2, -1, -1):
            diff = (sorted_dates[i+1] - sorted_dates[i]).days
            if diff == 1:
                current_streak += 1
            else:
                break
    else:
        current_streak = 0
        
    return current_streak, longest_streak

def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    all_problems = db.query(models.Problem).all()
    
    total = len(all_problems)
    solved_problems = [p for p in all_problems if p.completed]
    solved = len(solved_problems)
    remaining = total - solved
    percentage = (solved / total * 100) if total > 0 else 0.0
    
    # Topic breakdown
    topics = {}
    for p in all_problems:
        if p.topic not in topics:
            try:
                # Extract number prefix from filename (e.g., "05-arrays.md" -> 5)
                order_val = int(p.assignment_file.split('-')[0])
            except (ValueError, IndexError):
                order_val = 99
            topics[p.topic] = {"total": 0, "solved": 0, "order": order_val}
        topics[p.topic]["total"] += 1
        if p.completed:
            topics[p.topic]["solved"] += 1
            
    topic_progress = []
    for topic_name, counts in topics.items():
        t_total = counts["total"]
        t_solved = counts["solved"]
        t_pct = (t_solved / t_total * 100) if t_total > 0 else 0.0
        topic_progress.append(
            schemas.TopicProgress(
                topic=topic_name,
                total=t_total,
                solved=t_solved,
                percentage=round(t_pct, 1)
            )
        )
    # Sort topic progress by original curriculum order prefix
    topic_progress.sort(key=lambda x: topics[x.topic]["order"])
    
    # Difficulty breakdown
    diff_counts = {"Easy": 0, "Medium": 0, "Hard": 0, "NA": 0}
    diff_solved = {"Easy": 0, "Medium": 0, "Hard": 0, "NA": 0}
    
    for p in all_problems:
        diff = p.difficulty if p.difficulty in diff_counts else "NA"
        diff_counts[diff] += 1
        if p.completed:
            diff_solved[diff] += 1
            
    difficulty_breakdown = schemas.DifficultyBreakdown(
        easy=diff_counts["Easy"],
        easy_solved=diff_solved["Easy"],
        medium=diff_counts["Medium"],
        medium_solved=diff_solved["Medium"],
        hard=diff_counts["Hard"],
        hard_solved=diff_solved["Hard"],
        na=diff_counts["NA"],
        na_solved=diff_solved["NA"]
    )
    
    # Calculate streaks
    solved_dates = []
    for p in solved_problems:
        if p.date_solved:
            try:
                dt = datetime.date.fromisoformat(p.date_solved)
                solved_dates.append(dt)
            except ValueError:
                pass
                
    current_streak, longest_streak = calculate_streaks(solved_dates)
    
    # Recent activity: solved problems ordered by solved date desc, limit 5
    recent_activity = [p for p in solved_problems if p.date_solved]
    recent_activity.sort(key=lambda x: x.date_solved, reverse=True)
    
    return schemas.DashboardStats(
        total_questions=total,
        solved_questions=solved,
        remaining_questions=remaining,
        completion_percentage=round(percentage, 1),
        current_streak=current_streak,
        longest_streak=longest_streak,
        topic_progress=topic_progress,
        difficulty_breakdown=difficulty_breakdown,
        recent_activity=recent_activity[:5]
    )
