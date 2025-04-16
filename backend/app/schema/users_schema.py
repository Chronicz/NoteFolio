from pydantic import BaseModel,Field
from bson import ObjectId
from typing import Optional

class Users(BaseModel):
    name: str = Field(..., regex=r"^[A-Za-zÀ-ÿ' -]+(?:\s(?:Jr|Sr|III|II|IV))?$")
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., regex=r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;'\"<>,.?/-]).{6,80}$")

    class Config:
        # Ensures that the id is treated as a string when serialized
        json_encoders = {
            ObjectId: str
        }
        arbitrary_types_allowed=True

class UpdateUser(BaseModel):
    name:Optional[str]=None
    email:Optional[str]=None
    password:Optional[str]=None

class Token(BaseModel):
    access_token:str
    token_type:str

class UserLogin(BaseModel):
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., regex=r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;'\"<>,.?/-]).{6,80}$")


class TokenData(BaseModel):
    pass