from pydantic import BaseModel



class LikedRecipesResponse(BaseModel):
    liked_recipes: list