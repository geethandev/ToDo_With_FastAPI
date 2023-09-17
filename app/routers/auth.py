from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import HTMLResponse

from config import settings

from .. import main, models, schemas, utils
from ..database import get_db


''' 
    This router handles all the auth operations such as by 
    by creating user handling jwt token and verifying     
'''


router = APIRouter(
    tags=['authentication']
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

# Getting from Config file 
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes


def Access_Token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode["exp"] = expire  # Adding the expiration time to the dictionary
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_Token(token: str, credentials_exception):
    try:
        
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        id: str = payload.get('user_id')
        print(f"Token payload: {payload}")  # Debug statement
        
        if id is None:
            raise credentials_exception
        
        token_data = schemas.TokenData(id=id)
        return token_data
    except JWTError:
        raise credentials_exception
        

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        user_id = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate token")

# --------------------------------------------------------------------------------------------------------------------------------

def get_templates():
    return Jinja2Templates(directory="app/templates")

@router.get("/login/", response_class=HTMLResponse)
async def get_login_page(request: Request, templates: Jinja2Templates = Depends(get_templates)):
    return templates.TemplateResponse("login.html", {"request": request})


@router.post('/login/')
def login(user_credentials:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) :

        user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
 
         
        if not user:
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User Not Found')

        if not utils.verify(user_credentials.password, user.password):
           raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='incorrect password')

        
        token = Access_Token(data={"user_id": user.id})
        
        return {"token": token, "token_type": "Bearer"}

