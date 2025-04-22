from mongoengine import Document,StringField,ReferenceField,ListField
from models.payment_method import Payment_Method
from models.user_input import User_Input
class User(Document):
    name=StringField(required=True,max_length=40, min_length=4)
    email=StringField(required=True, min_length=10, max_length=50,unique=True)
    password=StringField(required=True, min_length=10, max_length=80) # I'll include the special regex in the schema
    #Relationships with the other models
    payment_methods=ListField(ReferenceField("Payment_Method"))
    user_input=ListField(ReferenceField("User_Input"))

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "payment_methods": [pm.to_dict() for pm in self.payment_methods],  # If needed
            "user_input": [ui.to_dict() for ui in self.user_input]  # If needed
        }

