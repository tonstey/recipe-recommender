from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.initialize import get_db, recipe_db
import ast

from helpers.clean import default_if_nan

from database.models import User, Pantry, RecipeList
from middlewares.authentication import decode_access_token
import jwt

router = APIRouter(prefix="/api/recipe", tags=["Recipes"])

@router.get("/likedrecipes")
def get_likedrecipes(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.query(RecipeList).filter(RecipeList.owner == user).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")

    return recipe_list.liked_recipes

  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.put("/addlikedrecipe")
def edit_likedrecipelist(recipe_id: int, username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.query(RecipeList).filter(RecipeList.owner == user).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")
    recipe_list.liked_recipes.append(recipe_id)
    db.commit()
    db.refresh(recipe_list)

    return recipe_list.liked_recipes
  
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
    

@router.put("/removelikedrecipe")
def remove_likedrecipelist(recipe_id: int, username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.query(RecipeList).filter(RecipeList.owner == user).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")
    recipe_list.liked_recipes = [i  for i in recipe_list.liked_recipes if i != recipe_id]
    db.commit()
    db.refresh(recipe_list)
    return recipe_list

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
    


@router.post("/recommend")
def recommend_recipes(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.query(Pantry).filter(Pantry.owner == user).first()
    if not pantry:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pantry not found.")

    recipe_list = db.query(RecipeList).filter(RecipeList.owner == user).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")

    pantry.stored_ingredients
    recipe_list.liked_recipes
    recommendations = []
    return recommendations
  
  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
  

@router.get("/search")
def get_recipes(recipe: str = "", page:int=1,limit: int =  10):
  try:
    print(recipe)
    print(page)
    print(limit)
    recipes = recipe_db.find({"name": { "$regex": recipe, "$options": "i"}}, {"_id": 0}).skip((page-1)*limit).limit(limit)

   

    
    recipeList = list(recipes)
    
    for i in recipeList:
      i['name'] = str(default_if_nan(i['name'], ""))
      i['id'] = int(default_if_nan(i['id'], 0))
      i['minutes'] = int(default_if_nan(i['minutes'], 0))
      i['tags'] = ast.literal_eval(default_if_nan(i['tags'], []))
      i['nutrition'] = ast.literal_eval(default_if_nan(i['nutrition'], []))
      i['n_steps'] = int(default_if_nan(i['n_steps'], 0))
      i['steps'] = ast.literal_eval(default_if_nan(i['steps'], []))
      i['description'] = str(default_if_nan(i['description'], ""))
      i['ingredients'] = ast.literal_eval(default_if_nan(i['ingredients'], []))
      i['n_ingredients'] = int(default_if_nan(i['n_ingredients'], 0))

 
    return recipeList

  except SQLAlchemyError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")