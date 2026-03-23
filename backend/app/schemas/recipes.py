from pydantic import BaseModel
from typing import List, Any

class RecipeListResponse(BaseModel):
    recipes: List[Any]

class LikedRecipesResponse(BaseModel):
    liked_recipes: List[Any]