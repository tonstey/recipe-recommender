from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime, timezone
from decouple import config
import jwt

oauth_schema = OAuth2PasswordBearer("/login")

def encode_access_token(data: dict, expire_delta: timedelta | None = None):
  try:
    encode_data = data.copy()

    expires = datetime.now(timezone.utc) + (expire_delta or timedelta(minutes=config("JWT_EXPIRE_MINUTES")))
    encode_data.update({"exp": expires})

    token = jwt.encode(encode_data, key=config("JWT_SECRET_KEY"), algorithm=config("JWT_ALGORITHM"))

    return token 
  except:
    raise HTTPException(400, detail="Unable to generate an access token")

def decode_access_token(token: str = Depends(oauth_schema)):
  try:
    payload = jwt.decode(token,  key=config("JWT_SECRET_KEY"), algorithm=config("JWT_ALGORITHM"))

    username = payload.get("username")

    if not username:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    
    return username

  except jwt.InvalidTokenError:
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")