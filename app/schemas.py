from pydantic import BaseModel,EmailStr
from typing import Optional


class TaskBase(BaseModel):
    title: str


class TaskCreate(BaseModel):
    title: str
    
class TaskUpdate(BaseModel):
    title: str

class TaskResponse(BaseModel):
    id: int
    title: str
    user_id: int
    completed: bool

class User(BaseModel):
    id: int
    email: str


class CreateUser(BaseModel):
    email: EmailStr
    password: str
    
    
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[int] = None
    


