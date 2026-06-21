from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app import models, schemas, crud, database
from app.importer import run_importer
from app.sync_user import sync_github_progress

app = FastAPI(title="DSAForge API", description="Backend API for DSAForge Personalized DSA Progress Tracker")


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure DB tables exist on start
models.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to DSAForge API. Use /api/problems or /api/dashboard to fetch data."}

@app.get("/api/problems", response_model=List[schemas.Problem])
def read_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    completed: Optional[bool] = None,
    search: Optional[str] = None,
    top_250: Optional[bool] = None,
    db: Session = Depends(database.get_db)
):
    return crud.get_problems(db, topic=topic, difficulty=difficulty, completed=completed, search=search, top_250=top_250)


@app.get("/api/problems/{problem_id}", response_model=schemas.Problem)
def read_problem(problem_id: int, db: Session = Depends(database.get_db)):
    db_problem = crud.get_problem(db, problem_id)
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return db_problem

@app.put("/api/problems/{problem_id}", response_model=schemas.Problem)
def update_problem(
    problem_id: int, 
    problem_update: schemas.ProblemUpdate, 
    db: Session = Depends(database.get_db)
):
    db_problem = crud.update_problem(db, problem_id, problem_update)
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return db_problem

@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def read_dashboard_stats(db: Session = Depends(database.get_db)):
    return crud.get_dashboard_stats(db)

@app.get("/api/topics", response_model=List[str])
def read_topics(db: Session = Depends(database.get_db)):
    # Fetch distinct topics sorted by curriculum order
    all_problems = db.query(models.Problem.topic, models.Problem.assignment_file).all()
    
    topic_order = {}
    for topic, filename in all_problems:
        if topic and topic not in topic_order:
            try:
                # Extract number prefix from filename (e.g. "05-arrays.md" -> 5)
                order_val = int(filename.split('-')[0])
            except (ValueError, IndexError):
                order_val = 99
            topic_order[topic] = order_val
            
    # Sort distinct topics by their order number
    sorted_topics = list(topic_order.keys())
    sorted_topics.sort(key=lambda x: topic_order[x])
    return sorted_topics

@app.post("/api/import")
def import_assignments(background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    try:
        imported, updated, status = run_importer(db)
        return {
            "status": status,
            "imported": imported,
            "updated": updated,
            "message": f"Successfully reloaded curriculum track. {imported} questions initialized!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@app.post("/api/sync-user")
def sync_user(github_username: Optional[str] = "AyushSaxena-0", repo_name: Optional[str] = "DSA", db: Session = Depends(database.get_db)):
    try:
        synced_count, status = sync_github_progress(db, github_username, repo_name)
        if status != "Success":
            raise HTTPException(status_code=400, detail=status)
        return {
            "status": "Success",
            "synced_count": synced_count,
            "message": f"Successfully synchronized progress with GitHub. {synced_count} new problems marked as completed!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

