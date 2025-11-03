from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.initialize import DB_Session

router = APIRouter(prefix="/", tags=[""])

@router.get("/")
def get_likedrecipes():
  pass


@router.put("/")
def edit_likedrecipelist():
  pass


@router.post("/recommend")
def recommend_recipes():
  pass