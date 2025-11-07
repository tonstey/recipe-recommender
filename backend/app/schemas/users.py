from pydantic import BaseModel, EmailStr
import uuid

class UserCreate(BaseModel):
  email: EmailStr
  username: str
  password: str

class UserEdit(BaseModel):
  email: EmailStr
  username: str

class UserRequest(BaseModel):
  username: str
  password: str

class UserResponse(BaseModel):
  id: int
  uuid: uuid.UUID
  username: str