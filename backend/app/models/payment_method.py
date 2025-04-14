from mongoengine import Document,StringField,EnumField,DateTimeField,ReferenceField
from datetime import datetime
from enum import Enum
class PaymentTypeEnum(Enum):
    VISA = "Visa"
    MASTERCARD = "MasterCard"
    AMEX = "Amex"
    DISCOVER = "Discover"
    OTHER = "Other"  # Add more card types as needed

# Helper function to validate expiration date
def validate_expiration_date(value):
    if value < datetime.now():
        raise ValueError("Expiration date must be at least one month in the future.")
    return value

class Payment_Method(Document):
    payment_card=StringField(required=True,min_length=16, max_length=16)
    card_user=StringField(required=True,min_length=5, max_length=25)
    zip_code=StringField(required=True,min_length=5,max_length=5)
    ccv=StringField(required=True, min_length=3,max_length=4)
    payment_type=EnumField(PaymentTypeEnum, required=True)
    expiration_date=DateTimeField(required=True, validation=validate_expiration_date)
    user=ReferenceField("User")

    # You can override the `save` method to ensure more complex logic is enforced.
    def save(self, *args, **kwargs):
        # Check if the expiration date is at least one month in the future
        if self.expiration_date < datetime.now():
            raise ValueError("Expiration date must be at least one month in the future.")
        return super(Payment_Method, self).save(*args, **kwargs)