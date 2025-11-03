from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.initialize import DB_Session

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup")
def signup_user():
  pass

@router.post("/login")
def login_user():
  pass

@router.get("/")
def get_user():
  pass

@router.put("/")
def edit_user():
  pass

@router.delete("/")
def delete_user():
  pass