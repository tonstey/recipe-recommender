from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database.initialize import get_db
from database.models import User, Pantry, RecipeList

from schemas.users import BaseUser, UserEmail, PublicUserResponse, LoginRequest, UserResponse, LoginResponse
from schemas.token import Token
from pydantic import EmailStr

from middlewares.authentication import encode_access_token, decode_access_token, decode_sendemail_token 

from helpers.password import password_checklist
from helpers.hash import hashToken
from helpers.mail import mail_token

from pwdlib import PasswordHash
from datetime import datetime, timezone, timedelta
import jwt
import secrets

router = APIRouter(prefix="/api/users", tags=["Users"])

password_hasher = PasswordHash.recommended()

# Signup user & begin verification step
@router.post("/signup", response_model=Token)
def signup_user(user: BaseUser, db: Session = Depends(get_db)):
  try:
    username_isTaken = db.scalars(select(User).where(User.username == user.username)).first()
    if username_isTaken:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Username is taken already.")

    email_isTaken= db.scalars(select(User).where(User.email == user.email)).first()
    if email_isTaken:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Email is in use already.")
    
    password_isValid, password_error = password_checklist(user.password)
    if not password_isValid:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=password_error)

    user.password = password_hasher.hash(user.password)

    create_user = User(**user.model_dump())
    db.add(create_user)
    db.flush()

    create_pantry = Pantry(owner = create_user, user_id = create_user.uuid)
    db.add(create_pantry)
    db.flush()

    create_recipelist = RecipeList(owner = create_user, user_id = create_user.uuid)
    db.add(create_recipelist)

    db.commit()

    token = encode_access_token({"email": create_user.email, "username": create_user.username,"action": "sendemail"}, encryption_type="JWT_SENDEMAIL_KEY", expire_delta=timedelta(minutes=5))
    return Token(token=token, token_type="login")

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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Login user
# If user isn't verified, begin verification step
@router.post("/login", response_model=LoginResponse)
def login_user(user: LoginRequest, db: Session = Depends(get_db)):
  try:
    requested_user = db.scalars(select(User).where(User.email == user.email)).first()

    if not requested_user or not requested_user.is_active:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    password_match = password_hasher.verify(user.password, requested_user.password)

    if not password_match:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    if not requested_user.isVerified:
      token = encode_access_token({"email": requested_user.email, "username": requested_user.username, "action": "sendemail"}, "JWT_SENDEMAIL_KEY", timedelta(minutes=5))
      return LoginResponse(token=Token(token=token, token_type="verify"), user_info=PublicUserResponse(username=requested_user.username, email=requested_user.email))

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

# Send verification email
@router.post("/verificationemail")
async def send_verification_email(verification_email:UserEmail, user: dict = Depends(decode_sendemail_token), db: Session = Depends(get_db)):
  try:
    email = verification_email.email

    requested_user = db.scalars(select(User).where(User.username == user["username"]).where(User.email == user["email"])).first()
    if not requested_user:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    
    if email != requested_user.email:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email not found in database.")
    
    if requested_user.isVerified:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Email is already verified. Please log in.")
    
    verify_token = secrets.token_urlsafe(32)

    requested_user.verificationToken = hashToken(verify_token)
    requested_user.verificationExpire = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()
    db.refresh(requested_user)

    res = await mail_token(requested_user.email, verify_token)
    if not res["success"]:
      requested_user.verificationToken = None
      requested_user.verificationExpire = None
      db.commit()
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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Verify email 
@router.post("/verification")
def verify_user(token: Token, db: Session = Depends(get_db)):
  try:
    requested_user = db.scalars(select(User).where(User.verificationToken == hashToken(token.token))).first()
    if not requested_user:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    
    if requested_user.isVerified:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Account already verified.")

    if not requested_user.verificationExpire or datetime.now(timezone.utc).replace(tzinfo=None) > requested_user.verificationExpire:
      raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Verification token expired. Please log in to resend verification link.") 

    requested_user.isVerified = True
    requested_user.verificationToken = None
    requested_user.verificationExpire = None
    requested_user.is_active = True
    db.commit()

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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Get user's data
@router.get("/data", response_model=UserResponse)
def get_user(username: str = Depends(decode_access_token), db: Session = Depends(get_db)):
  try:
    requested_user = db.scalars(select(User).where(User.username == username)).first()
    if not requested_user or not requested_user.is_active:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    return UserResponse(email=requested_user.email, uuid=requested_user.uuid, username=requested_user.username)
  
  except HTTPException as e:
    print(str(e))
    raise HTTPException(e.status_code, detail=e.detail)
  except SQLAlchemyError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
  except jwt.PyJWTError as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, please try again later.")
  except Exception as e:
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Update user data
@router.put("/data")
def update_user(user: BaseUser, username: str = Depends(decode_access_token), db:Session = Depends(get_db)):
  try:
    requested_user = db.scalars(select(User).where(User.username == username)).first()

    if not requested_user or not requested_user.is_active:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Change email affiliated with user
@router.put("/newemail", response_model=Token)
def change_email(email_data: UserEmail, user: dict = Depends(decode_sendemail_token), db: Session = Depends(get_db)):
  try:
    if user["email"] != email_data.oldEmail:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Information does not match. Please log in again.")

    requested_user = db.scalars(select(User).where(User.username == user["username"])).first()
    if not requested_user or not requested_user.is_active:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    
    if requested_user.isVerified:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="User is already verified. Cannot change email.")
    
    useremail_isDuplicated = db.scalars(select(User).where(User.email == email_data.newEmail)).first()
    if useremail_isDuplicated and useremail_isDuplicated.id != requested_user.id:
      raise HTTPException(status.HTTP_409_CONFLICT, detail="Email is already in use.")

    requested_user.email = email_data.newEmail
    requested_user.isVerified = False
    requested_user.verificationToken = None
    requested_user.verificationExpire = None

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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

# Render user inactive
@router.delete("/data")
def delete_user(username: str = Depends(decode_access_token),  db: Session = Depends(get_db)):
  try:
    requested_user = db.scalars(select(User).where(User.username == username)).first()

    if not requested_user or not requested_user.is_active:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    requested_user.is_active = False
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
    db.rollback()
    print(str(e))
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")
