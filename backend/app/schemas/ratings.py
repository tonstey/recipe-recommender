from pydantic import BaseModel
import uuid

class BaseRatingRequest(BaseModel):
    recipe_id:int

class ScoreRatingRequest(BaseRatingRequest):
    score:int

class RatingResponse(BaseModel):
    rating_sum: int
    rating_count:int

