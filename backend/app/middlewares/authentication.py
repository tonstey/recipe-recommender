from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime, timezone
from decouple import config
import jwt

oauth_schema = OAuth2PasswordBearer("/login")

def encode_access_token(data: dict, encryption_type: str, expire_delta: timedelta | None = None):
  try:
    encode_data = data.copy()

    expires = datetime.now(timezone.utc) + (expire_delta or timedelta(minutes=int(config("JWT_EXPIRE_MINUTES"))))
    encode_data.update({"exp": expires})

    token = jwt.encode(encode_data, key=config(encryption_type), algorithm=config("JWT_ALGO"))
    return token 
  except Exception as e:
    print(str(e))
    raise HTTPException(400, detail="Unable to generate an access token")

def decode_access_token( token: str = Depends(oauth_schema)):
  try:
    payload = jwt.decode(token,  key=config("JWT_ACCESS_KEY"), algorithms=[config("JWT_ALGO")] )

    action = payload.get("action")
    

    if action == "loginuser":
      username = payload.get("username")

      if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

      return username
    
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

  except jwt.InvalidTokenError:
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

def decode_sendemail_token(token: str = Depends(oauth_schema)):
  try:
    payload = jwt.decode(token,  key=config("JWT_SENDEMAIL_KEY"), algorithms=[config("JWT_ALGO")])

    action = payload.get("action")
    
    if action == "sendemail":
      email = payload.get("email")
      username = payload.get("username")
      if not email or not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
      return {"email": email, "username": username}

    
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid action.")

  except jwt.InvalidTokenError as e:
    print(str(e))
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token. Please log in again.")

