from fastapi import Request,APIRouter, Depends, HTTPException
from utils.jwt_helper import create_access_token,create_refresh_token,decodeJWT
from schema.token import Token,TokenData
import jwt

router=APIRouter()

@router.post('/token/refresh')
async def refresh_access_token(request:Request):
    body=request.json()
    refresh_token=body.get("refresh_token")
    if not refresh_token: #if there is no refresh token then it is invalid
        raise HTTPException(status_code=400, detail="Refresh token is required")
    try:
        payload=decodeJWT(refresh_token)
        email=payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid refresh token")
        new_access_token=create_access_token({"sub":email})
        new_refresh_token=create_refresh_token({"sub":email})
        return{
            "access_token":new_access_token,
            "refresh_token":new_refresh_token
        }
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid refresh token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Refresh token has expired")