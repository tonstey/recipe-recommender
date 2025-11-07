from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid

class PantryBase(BaseModel):
  id: int
  uuid: uuid