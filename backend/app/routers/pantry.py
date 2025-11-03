from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.initialize import DB_Session

router = APIRouter(prefix="/pantry", tags=[""])

@router.get("/")
def get_pantry():
  pass

@router.post("/")
def create_pantry():
  pass

@router.put("/")
def edit_pantry():
  pass

@router.put("/")
def delete_pantry():
  pass