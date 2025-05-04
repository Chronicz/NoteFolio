from pydantic import BaseModel,Field
from bson import ObjectId
from typing import Optional,List
import datetime

class User_Inputs(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    postedDate: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True


class User_Input_Update(BaseModel):
    title: Optional[str]
    content: Optional[str]
    tags: Optional[List[str]]
    postedDate: Optional[datetime]