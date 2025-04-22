from datetime import datetime, timedelta,timezone
from dotenv import load_dotenv
from fastapi import HTTPException,Request,Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
load_dotenv()

def create_access_token(data:dict, expires_delta:timedelta | None=None):
    to_encode = data.copy()
    access_token_min=os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    if expires_delta:
        expire = datetime + expires_delta
    else:
        expire = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=access_token_min)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "secret", algorithm=os.getenv("JWT_ALGORITHM"))
    return encoded_jwt

async def create_refresh_token(data:dict, expires_delta:timedelta | None=None):
    to_encode = data.copy()
    if expires_delta:
        expire=datetime+expires_delta
    else:
        expire=datetime.now(timezone.utc).replace(tzinfo=None)+timedelta(days=7)
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,"secret",algorithm=os.getenv("JWT_ALGORITHM"))
    return encoded_jwt

def decodeJWT(jwt_token):
    try:
        payload=jwt.decode(jwt_token,os.getenv("SECRET_KEY"),algorithms=[os.getenv("JWT_ALGORITHM")])
        return payload
    except jwt.InvalidTokenError:
        return None
    

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            token = credentials.credentials
            if not self.verify_jwt(token):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return token
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        try:
            payload = decodeJWT(jwtoken)
            return True
        except jwt.ExpiredSignatureError:
            return False
        except jwt.JWTError:
            return False
