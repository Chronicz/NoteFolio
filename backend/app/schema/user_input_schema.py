from pydantic import BaseModel,Field
from bson import ObjectId
from typing import Optional,List
import datetime

class User_Input(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")  # MongoDB _id field
    posted_date=datetime.datetime
    title:str
    content:str
    tags:List[str]
    class Config:
        # Ensures that the id is treated as a string when serialized
        json_encoders = {
            ObjectId: str
        }

