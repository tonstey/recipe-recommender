from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
  token: str
  token_type: str
