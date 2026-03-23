from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.initialize import get_db, recipe_db

from helpers.clean import convert_recipes

from database.models import User, Pantry, RecipeList
from schemas.recipes import RecipeListResponse, LikedRecipesResponse
from middlewares.authentication import decode_access_token
import jwt

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

# Method uses query to find recipes with similar names
# Returns queried recipe list
@router.get("/", response_model=RecipeListResponse)
def get_recipe_list(recipe: str = "", page:int=1, limit: int =  10):
  try:
    page=max(page, 1)
    limit = min(max(limit, 1), 100)

    recipes = recipe_db.find({"name": { "$regex": recipe, "$options": "i"}}, {"_id": 0, "rating_sum": 0, "rating_count": 0}).skip((page-1)*limit).limit(limit)
    
    recipeList = list(recipes)
    
    recipeList = [convert_recipes(i) for i in recipeList]
    return RecipeListResponse(recipes=recipeList or [])
  
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Method returns user's liked recipes
@router.get("/liked", response_model=LikedRecipesResponse)
def get_likedrecipes(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
  
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.scalars(select(RecipeList).where(RecipeList.user_id == user.uuid)).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")

    return LikedRecipesResponse(liked_recipes=recipe_list.liked_recipes or [])

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

# Method adds recipe to liked recipe list if it doesn't exist already
@router.put("/liked/{recipe_id}", response_model=LikedRecipesResponse)
def edit_likedrecipelist(recipe_id: int, username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.scalars(select(RecipeList).where(RecipeList.user_id == user.uuid)).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")
    
    if recipe_id not in recipe_list.liked_recipes:
      recipe_list.liked_recipes.append(recipe_id)
      db.commit()
      db.refresh(recipe_list)

    return LikedRecipesResponse(liked_recipes=recipe_list.liked_recipes or [])
  
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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
    
# Method removes recipe from liked recipe list
@router.delete("/liked/{recipe_id}", response_model=LikedRecipesResponse)
def remove_likedrecipelist(recipe_id: int, username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    recipe_list = db.scalars(select(RecipeList).where(RecipeList.user_id == user.uuid)).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")
    
    recipe_list.liked_recipes = [i for i in recipe_list.liked_recipes if i != recipe_id]

    db.commit()
    db.refresh(recipe_list)
    return LikedRecipesResponse(liked_recipes=recipe_list.liked_recipes or [])

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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
    
# Method recommends recipes based on what is liked and ingredients stored in pantry
# Return recommended recipes
@router.post("/recommend", response_model=RecipeListResponse)
def recommend_recipes(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    pantry = db.scalars(select(Pantry).where(Pantry.user_id == user.uuid)).first()
    if not pantry:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pantry not found.")

    recipe_list = db.scalars(select(RecipeList).where(RecipeList.user_id == user.uuid)).first()
    if not recipe_list:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Recipe list not found.")

    pantry.stored_ingredients
    recipe_list.liked_recipes
    recommendations = []
    return RecipeListResponse(recipes=recommendations or [])
  
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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
  
# Method returns single recipe
@router.get("/{recipeID}")
def get_recipe(recipeID: int = 0):
  try:
    recipe = recipe_db.find_one({"id": recipeID}, {"_id": 0, "rating_sum": 0, "rating_count": 0})
    
    if not recipe:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found.")

    return convert_recipes(recipe)

  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

