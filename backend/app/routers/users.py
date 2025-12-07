from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database.initialize import get_db
from database.models import User, Pantry, RecipeList

from schemas.users import BaseUser, UserEmail, PublicUserInfo, LoginRequest, UserResponse, LoginResponse
from schemas.token import Token

from middlewares.authentication import encode_access_token, decode_access_token, decode_sendemail_token 

from helpers.password import password_checklist
from helpers.hash import hashToken
from helpers.mail import mail_token

from pwdlib import PasswordHash
import jwt
import uuid
from datetime import datetime, timezone, timedelta
import secrets

router = APIRouter(prefix="/api/users", tags=["Users"])

password_hasher = PasswordHash.recommended()

@router.post("/test")
async def test(email: str):
  try:
    return await mail_token(email, "asdf456")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="FAILURE")

@router.post("/signup", response_model=Token)
def signup_user(user: BaseUser, db: Session = Depends(get_db)):
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

    token = encode_access_token({"email": create_user.email, "username": create_user.username,"action": "sendemail"}, encryption_type="JWT_SENDEMAIL_KEY", expire_delta=timedelta(minutes=5))
    return Token(token=token, token_type="bearer")

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
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

@router.post("/login", response_model=LoginResponse)
def login_user(user: LoginRequest, db: Session = Depends(get_db)):
  try:
    requested_user = db.query(User).filter(User.email == user.email).first()

    if not requested_user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    password_match = password_hasher.verify(user.password, requested_user.password)

    if not password_match:
      raise HTTPException( status.HTTP_400_BAD_REQUEST, detail="Incorrect password.")

    if not requested_user.isVerified:
      token = encode_access_token({"email": requested_user.email, "username": requested_user.username, "action": "sendemail"}, "JWT_SENDEMAIL_KEY", timedelta(minutes=5))
      return LoginResponse(token=Token(token=token, token_type="verify"), user_info=PublicUserInfo(username=requested_user.username, email=requested_user.email))

    token = encode_access_token({"username": requested_user.username, "action": "loginuser"}, "JWT_ACCESS_KEY",timedelta(minutes=60))

    return LoginResponse(token=Token(token=token, token_type="login"))
  
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


@router.post("/sendemail")
async def verify_user(reqBody: UserEmail, user: dict = Depends(decode_sendemail_token), db: Session = Depends(get_db)):
  try:
    requested_user = db.query(User).filter(User.username == user["username"], User.email == user["email"]).first()
    
    if not requested_user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    if reqBody.email != requested_user.email:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email not found in database.")
    
    if requested_user.isVerified:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Email is already verified. Please log in.")
    
    verify_token = secrets.token_urlsafe(32)

    requested_user.verificationToken = hashToken(verify_token)
    requested_user.verificationExpire = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()
    db.refresh(requested_user)

    res = await mail_token(requested_user.email, verify_token)
    if not res["success"]:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=res.message)
    
    return True

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
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

@router.post("/confirm")
def confirm_user(token: Token, db: Session = Depends(get_db)):
  try:
    requested_user = db.query(User).filter(User.verificationToken == hashToken(token.token)).first()
    
    if not requested_user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    if requested_user.isVerified:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Account already verified.")

    if datetime.now(timezone.utc) > requested_user.verificationExpire.replace(tzinfo=timezone.utc):
      raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Verification token expired. Please log in to resend verification link.") 

    requested_user.isVerified = True
    requested_user.verificationToken = None
    db.commit()

    return True
  
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

@router.get("/getuserdata", response_model=UserResponse)
def get_user(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    return user
  
  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
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
def update_user(user: BaseUser, username: str = Depends(decode_access_token), db:Session = Depends(get_db)):
  try:
    requested_user = db.query(User).filter(User.username == username).first()

    if (requested_user.uuid != user.uuid):
      raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Token does not match with requested information.")

  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
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


@router.put("/changeemail", response_model=Token)
def change_email(new_user_data: UserEmail, user: dict = Depends(decode_sendemail_token), db: Session = Depends(get_db)):
  try:
    if user["email"] != new_user_data.oldEmail:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Information does not match. Please log in again.")

    requested_user = db.query(User).filter(User.username == user["username"]).first()

    if not requested_user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    duplicate_email_user = db.query(User).filter(User.email == new_user_data.newEmail).first()

    if duplicate_email_user and duplicate_email_user.id != requested_user.id:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Email is already in use.")

    requested_user.email = new_user_data.newEmail

    db.commit()
    db.refresh(requested_user)

    token = encode_access_token({"email": requested_user.email, "username": requested_user.username, "action": "sendemail"}, "JWT_SENDEMAIL_KEY", timedelta(minutes=5))
    return Token(token=token, token_type="verify")
  
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
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.delete("/delete")
def delete_user(username: str = Depends(decode_access_token),  db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.username == username).first()

    if not user:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(user)
    db.commit()

    return {"success": True}
  
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
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
