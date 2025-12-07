from pydantic import BaseModel, EmailStr
from .token import Token
from typing import Optional
import uuid


class BaseUser(BaseModel):
  uuid: Optional[uuid.UUID]
  email: EmailStr
  username: str
  password: str

class UserEmail(BaseModel):
  oldEmail: Optional[EmailStr] = None
  newEmail: Optional[EmailStr] = None
  email: Optional[EmailStr] = None

class PublicUserInfo(BaseModel):
  username: str
  email: EmailStr

class UserResponse(BaseModel):
  id: int
  uuid: uuid.UUID
  username: str

class LoginRequest(BaseModel):
  email: str
  password: str

class LoginResponse(BaseModel):
  token: Token
  user_info: Optional[PublicUserInfo] = None