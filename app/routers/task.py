from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.templating import Jinja2Templates
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import HTMLResponse

from .. import models, schemas
from ..database import get_db
from ..routers import auth

router = APIRouter(
    tags=['tasks']
)  
def get_templates():
    return Jinja2Templates(directory="app/templates")

@router.get("/dashboard/", response_class=HTMLResponse)
async def get_dashboard_page(request: Request, templates: Jinja2Templates = Depends(get_templates)):  # Inject templates
    return templates.TemplateResponse("dashboard.html", {"request": request})

# get task by limit
@router.get("/task/",response_model = List[schemas.TaskResponse])
async def get_post(db: Session = Depends(get_db),Current_user: int = Depends(auth.get_current_user),):
    try:
        tasks = db.query(models.Task).filter(models.Task.user_id == Current_user).all()
        return  tasks
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


#  Create post
@router.post("/task/", status_code=status.HTTP_201_CREATED, response_model=schemas.TaskResponse)
async def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(auth.get_current_user)
):
    try:
        new_task = models.Task(**task.dict(), user_id=current_user)
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return new_task
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
# Update task
@router.put("/task/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: int,
    updated_task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(auth.get_current_user)
):
    try:
        task = db.query(models.Task).filter(
            models.Task.id == task_id, models.Task.user_id == current_user
        ).first()

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Task not found'
            )

        for key, value in updated_task.dict(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating task: {str(e)}"
        )
        
        
# Delete task
@router.delete("/task/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(auth.get_current_user)
):
    try:
        task = db.query(models.Task).filter(
            models.Task.id == task_id, models.Task.user_id == current_user
        ).first()

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Task not found'
            )

        db.delete(task)
        db.commit()
        return None  # return None with status 204 No Content on success
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )