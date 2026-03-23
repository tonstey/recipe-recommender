from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uuid

class PantryBase(BaseModel):
  id: int
  uuid: uuid.UUID

class EditPantryRequest(BaseModel):
  ingredient_id: int
  method: str

class PantryResponse(BaseModel):
  uuid: uuid.UUID
  stored_ingredients: List[Any]

class Ingredient(BaseModel):
  name: str
  id: int
