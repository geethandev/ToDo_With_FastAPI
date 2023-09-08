from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,DateTime,func
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    
    # Defined a one-to-many relationship with tasks
    tasks = relationship("Task", back_populates="user")
    
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tasks")
    completed = Column(Boolean, default=False)
    
    # Defined a many-to-one relationship with users
    user = relationship("User", back_populates="tasks")