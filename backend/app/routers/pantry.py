from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from database.initialize import get_db, ingredient_db
from database.models import User, Pantry
import uuid
from middlewares.authentication import decode_access_token

from pydantic import BaseModel
from typing import Any, List
import jwt

router = APIRouter(prefix="/api/pantry", tags=["Pantries"])

class PantryResponse(BaseModel):
  uuid: uuid.UUID
  stored_ingredients: List[Any]


@router.get("/getpantry", response_model=PantryResponse)
def get_pantry(username:str = Depends(decode_access_token), db: Session=Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.query(Pantry).filter(Pantry.owner == user).first()

    if not pantry:
      raise HTTPException(404, detail="Pantry not found.")
    
    ingredients = ingredient_db.find(pantry.stored_ingredients)

    pantry_response = pantry.copy()
    pantry_response.stored_ingredients = ingredients

    return pantry_response
  
  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.put("/editpantry")
def edit_pantry(ingredient_id: int, method: str, username:str = Depends(decode_access_token), db: Session=Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.query(Pantry).filter(Pantry.owner == user).first()

    if not pantry:
      raise HTTPException(404, detail="Pantry not found.")
    
    pantry.stored_ingredients.append(ingredient_id)
    db.commit()
    db.refresh(pantry)
    return pantry

  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.delete("/deletepantry")
def delete_pantry(username:str = Depends(decode_access_token), db: Session=Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.query(Pantry).filter(Pantry.owner == user).first()

    if not pantry:
      raise HTTPException(404, detail="Pantry not found.")

    pantry.delete()
    db.commit()
    return

  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


class Ingredient(BaseModel):
  name: str
  id: int


@router.get("/search", response_model=list[Ingredient])
def search_ingredient(ingredient: str, limit: int=20):
  if not ingredient:
    return []

  results = ingredient_db.find({"name": { "$regex": ingredient, "$options": "i"}}).limit(limit)

  return results
