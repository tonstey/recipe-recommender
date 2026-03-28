from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.initialize import get_db, recipe_db, recipe_scores

from helpers.clean import convert_recipes
from pymongo import errors

from database.models import User, Pantry, RecipeList, Rating
from schemas.recipes import RecipeListResponse, LikedRecipesResponse
from middlewares.authentication import decode_access_token

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import jwt

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

# Method uses query to find recipes with similar names
# Returns queried recipe list
@router.get("/", response_model=RecipeListResponse)
def get_recipe_list(recipe: str = "", page:int=1, limit: int =  10):
  try:
    page=max(page, 1)
    limit = min(max(limit, 1), 100)

    recipes = recipe_db.find({"name": { "$regex": recipe, "$options": "i"}}, {"_id": 0, "rating_sum": 0, "rating_count": 0, "ingredients_id": 0}).skip((page-1)*limit).limit(limit)
    
    recipeList = list(recipes)
    
    recipeList = [convert_recipes(i) for i in recipeList]
    return RecipeListResponse(recipes=recipeList or [])
  
  except errors.PyMongoError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
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
@router.get("/recommend")
def recommend_recipes(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.scalars(select(User).where(User.username == username)).first()
    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    pantry = db.scalars(select(Pantry).where(Pantry.user_id == user.uuid)).first()
    if not pantry:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pantry not found.")
    
    liked_recipes = db.scalars(select(RecipeList).where(RecipeList.user_id == user.uuid)).first()
    if not liked_recipes:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Liked recipes not found.")

    user_ing = pantry.stored_ingredients
    ids = list(recipe_scores.keys())
    recipes = list(recipe_db.find({"id": {"$in":ids}}, {"_id": 0, "id": 1, "ingredients_id": 1}))

    final_scores = []

    for i in recipes: 
      recipe_ingredients = i["ingredients_id"]if "ingredients_id" in i else []

      intersection = len( set(user_ing).intersection(recipe_ingredients))
      union = len(set(user_ing).union(recipe_ingredients))
      jaccard = intersection / union if union != 0 else 0

      rating = db.scalars(select(Rating).where(Rating.user_uuid == user.uuid).where(Rating.recipe_id == i["id"])).first()
      isLiked = i["id"] in liked_recipes.liked_recipes

      if rating:
        final_score = 0.6 * jaccard + 0.25 * (rating.score / 5) + 0.15 * (recipe_scores[i["id"]] / 5)
      else:
        final_score = 0.75 * jaccard + 0.25 * (recipe_scores[i["id"]] / 5)

      if isLiked:
        final_score += 0.1

      final_scores.append((i["id"], final_score))

    final_scores.sort(key=lambda x: x[1], reverse=True)
    top_recommended = final_scores[:50]
    recommended_ids = [i[0] for i in top_recommended]

    recommended_recipes = list(recipe_db.find({"id": {"$in":recommended_ids}}, {"_id": 0, "rating_sum": 0, "rating_count": 0,"ingredients_id": 0}))
    recommended_recipes = [convert_recipes(i) for i in recommended_recipes] 
    recommended = [{"recipe": i, "score": j[1]} for i,j in zip(recommended_recipes, top_recommended)]
    

    return recommended
  except HTTPException as e: 
    print(str(e)) 
    raise HTTPException(e.status_code, detail=e.detail) 
  except errors.PyMongoError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except SQLAlchemyError as e: 
    print(str(e)) 
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later") 
  except jwt.PyJWTError as e: 
    print(str(e)) 
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.") 
  except Exception as e: 
    print(str(e)) 
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.") 

# Method returns single recipe
@router.get("/{recipeID}")
def get_recipe(recipeID: int = 0):
  try:
    recipe = recipe_db.find_one({"id": recipeID}, {"_id": 0, "rating_sum": 0, "rating_count": 0, "ingredients_id": 0})
    
    if not recipe:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found.")

    return convert_recipes(recipe)
  
  except errors.PyMongoError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

