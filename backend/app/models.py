from sqlalchemy import Column, Integer, String, Boolean, Text
from .database import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True, nullable=False)
    problem_name = Column(String, index=True, nullable=False)
    leetcode_number = Column(String, default="NA", nullable=True)
    difficulty = Column(String, default="NA", nullable=True)
    direct_url = Column(String, default="", nullable=True)
    assignment_file = Column(String, nullable=False)
    
    # User progress fields
    completed = Column(Boolean, default=False, nullable=False)
    revision_count = Column(Integer, default=0, nullable=False)
    notes = Column(Text, default="", nullable=False)
    date_solved = Column(String, nullable=True) # Stored as YYYY-MM-DD
    is_top_250 = Column(Boolean, default=False, nullable=False)

