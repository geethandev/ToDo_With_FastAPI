from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.templating import Jinja2Templates
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import HTMLResponse

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix = '/signup',
    tags=['users']
)


# Defined a dependency to inject the templates variable
def get_templates():
    return Jinja2Templates(directory="app/templates")

@router.get("/", response_class=HTMLResponse)
async def get_signup_page(request: Request, templates: Jinja2Templates = Depends(get_templates)):  # Inject templates
    return templates.TemplateResponse("signup.html", {"request": request})

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.CreateUser, db: Session = Depends(get_db)):
    try:
        
        # Hashing the password
        hashed_password = utils.hash(user.password)
        user.password = hashed_password        
        new_user = models.User(**user.dict())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {'message': 'User created'}
    except IntegrityError as e:
        if "UNIQUE KEY constraint" in str(e):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists. Please use another email.')
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        
