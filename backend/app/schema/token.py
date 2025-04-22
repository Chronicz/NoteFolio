from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm,HTTPBearer

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str
    