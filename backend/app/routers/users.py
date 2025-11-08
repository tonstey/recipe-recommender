from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from database.initialize import get_db
from database.models import User, Pantry, RecipeList
from schemas.users import UserCreate, UserEdit, UserRequest, UserResponse
from schemas.token import Token
from middlewares.authentication import encode_access_token, decode_access_token
from helpers.password import password_checklist

from pwdlib import PasswordHash
import jwt
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

password_hasher = PasswordHash.recommended()

@router.post("/signup")
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
  try:
    check_username = db.query(User).filter(User.username == user.username).first()

    if check_username:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Username is taken already.")

    check_email = db.query(User).filter(User.email == user.email).first()

    if check_email:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Email is in use already.")
    
    password_status, password_error = password_checklist(user.password)
    if not password_status:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=password_error)

    user.password = password_hasher.hash(user.password)

    create_user = User(**user.model_dump())
    db.add(create_user)
    db.flush()

    create_pantry = Pantry(owner = create_user)
    db.add(create_pantry)
    db.flush()

    create_recipelist = RecipeList(owner = create_user)
    db.add(create_recipelist)

    db.commit()
    return {"success":True}

  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.post("/login", response_model=Token)
def login_user(user: UserRequest, db: Session = Depends(get_db)):
  try:
    requested_user = db.query(User).filter(User.username == user.username).first()

    if not requested_user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    password_match = password_hasher.verify(user.password, requested_user.password)

    if not password_match:
      raise HTTPException( status.HTTP_400_BAD_REQUEST, detail="Incorrect password.")

    token = encode_access_token({"username": requested_user.username})

    return Token(access_token=token, token_type="bearer")
  except SQLAlchemyError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")



  

@router.get("/getuserdata", response_model=UserResponse)
def get_user(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    return user
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, please try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.put("/updateuser")
def edit_user(editUser: UserEdit, username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    update_data = editUser.model_dump()

    for key, value in update_data.items():
      setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.delete("/{user_uuid}")
def delete_user(user_uuid: uuid.UUID,  db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.uuid == user_uuid).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(user)
    db.commit()

    return {"success": True}
  except SQLAlchemyError as e:
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, plyease try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
