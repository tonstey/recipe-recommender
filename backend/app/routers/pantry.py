from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from database.initialize import get_db, ingredient_db
from database.models import User, Pantry
from middlewares.authentication import decode_access_token

from schemas.pantry import PantryResponse, Ingredient, EditPantryRequest
import jwt

router = APIRouter(prefix="/api/pantry", tags=["Pantries"])

# Method returns ingredients list
@router.get("/", response_model=PantryResponse)
def get_pantry(username:str = Depends(decode_access_token), db: Session=Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.scalars(select(Pantry).where(Pantry.user_id == user.uuid)).first()
    if not pantry:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pantry not found.")
    
    ingredients = ingredient_db.find({"id": {"$in": pantry.stored_ingredients}}, {"_id": 0})


    return PantryResponse(uuid=pantry.uuid, stored_ingredients=list(ingredients))
  
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

# Method adds or removes ingredient from ingredient list based on request
# Return updated ingredient list
@router.put("/", response_model=PantryResponse)
def edit_pantry(req: EditPantryRequest, username:str = Depends(decode_access_token), db: Session=Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.scalars(select(Pantry).where(Pantry.user_id == user.uuid)).first()
    if not pantry:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pantry not found.")
    
    if req.method == "add":
      if req.ingredient_id not in pantry.stored_ingredients:
        if not ingredient_db.find_one({"id": req.ingredient_id}):
          raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Ingredient not found")

        pantry.stored_ingredients.append(req.ingredient_id)
    elif req.method == "remove":
      pantry.stored_ingredients = [i for i in pantry.stored_ingredients if i != req.ingredient_id]
    else:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid method")
    
    db.commit()
    db.refresh(pantry)

    ingredients = ingredient_db.find({"id": {"$in": pantry.stored_ingredients}}, {"_id": 0})

    return PantryResponse(uuid=pantry.uuid, stored_ingredients=list(ingredients))

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

# Method uses query to find ingredients with similar name
# Returns list of ingredients
@router.get("/search", response_model=list[Ingredient])
def search_ingredient(ingredient:str, page:int = 1,  limit:int = 20):
  page=max(page, 1)
  limit = min(max(limit, 1), 100)

  if not ingredient:
    return []

  results = ingredient_db.find({"name": { "$regex": ingredient, "$options": "i"}}, {"_id": 0}).skip((page-1)*limit).limit(limit)

  return list(results)
