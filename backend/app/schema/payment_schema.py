from pydantic import BaseModel, Field, validator
from bson import ObjectId
from typing import Optional
import re
from enum import Enum
import datetime

class PaymentType(str, Enum):
    visa = "Visa"
    mastercard = "MasterCard"
    amex = "Amex"
    discover = "Discover"
    other="Other"
    # Add other payment types as needed

class Payment_Methods(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")  # MongoDB _id field
    payment_card: str = Field(..., regex=r"^\d{16}$")
    card_user: str = Field(..., regex=r"^[A-Za-zÀ-ÿ' -]+(?:\s(?:Jr|Sr|III|II|IV))?$")
    zip_code: str = Field(..., regex=r"^[1-9]\d{4}$")
    ccv: str = Field(..., regex=r"^\d{3,4}$")
    payment_type: PaymentType
    expiration_date: str  # MM/YY or MM/YYYY format

    # Validator for expiration date
    @validator('expiration_date')
    def validate_expiration_date(cls, v):
        # Ensure the format is MM/YY or MM/YYYY
        if not re.match(r"^(0[1-9]|1[0-2])\/\d{2,4}$", v):
            raise ValueError('Expiration date must be in MM/YY or MM/YYYY format')

        # Parse the expiration date
        exp_date = datetime.datetime.strptime(v, '%m/%y') if len(v) == 5 else datetime.datetime.strptime(v, '%m/%Y')

        # Ensure expiration date is at least one month in the future
        current_date = datetime.datetime.now()
        if exp_date <= current_date:
            raise ValueError('Expiration date must be at least one month in the future.')

        return v

    class Config:
        # Ensures that the id is treated as a string when serialized
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }


class Payment_Methods_Update(BaseModel):
    id: Optional[ObjectId] = None  # MongoDB _id field
    payment_card: Optional[str] = None
    card_user: Optional[str] = None
    zip_code: Optional[str] =None
    ccv: Optional[str] = None
    payment_type: Optional[PaymentType]=None
    expiration_date: Optional[str]=None  # MM/YY or MM/YYYY format

    # Validator for expiration date
    @validator('expiration_date')
    def validate_expiration_date(cls, v):
        # Ensure the format is MM/YY or MM/YYYY
        if not re.match(r"^(0[1-9]|1[0-2])\/\d{2,4}$", v):
            raise ValueError('Expiration date must be in MM/YY or MM/YYYY format')

        # Parse the expiration date
        exp_date = datetime.datetime.strptime(v, '%m/%y') if len(v) == 5 else datetime.datetime.strptime(v, '%m/%Y')

        # Ensure expiration date is at least one month in the future
        current_date = datetime.datetime.now()
        if exp_date <= current_date:
            raise ValueError('Expiration date must be at least one month in the future.')

        return v

    class Config:
        # Ensures that the id is treated as a string when serialized
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }