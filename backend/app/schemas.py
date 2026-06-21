from pydantic import BaseModel
from typing import Optional, List, Dict

class ProblemBase(BaseModel):
    topic: str
    problem_name: str
    leetcode_number: str
    difficulty: str
    direct_url: str
    assignment_file: str
    completed: bool
    revision_count: int
    notes: str
    date_solved: Optional[str] = None
    is_top_250: bool = False


class ProblemCreate(BaseModel):
    topic: str
    problem_name: str
    leetcode_number: str
    difficulty: str
    direct_url: str
    assignment_file: str

class ProblemUpdate(BaseModel):
    completed: Optional[bool] = None
    revision_count: Optional[int] = None
    notes: Optional[str] = None
    date_solved: Optional[str] = None

class Problem(ProblemBase):
    id: int

    class Config:
        from_attributes = True

class TopicProgress(BaseModel):
    topic: str
    total: int
    solved: int
    percentage: float

class DifficultyBreakdown(BaseModel):
    easy: int
    easy_solved: int
    medium: int
    medium_solved: int
    hard: int
    hard_solved: int
    na: int
    na_solved: int

class DashboardStats(BaseModel):
    total_questions: int
    solved_questions: int
    remaining_questions: int
    completion_percentage: float
    current_streak: int
    longest_streak: int
    topic_progress: List[TopicProgress]
    difficulty_breakdown: DifficultyBreakdown
    recent_activity: List[Problem]
