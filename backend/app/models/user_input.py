import db.mongo_db
from mongoengine import Document,StringField,DateField,DateTimeField,ListField, ReferenceField
from datetime import timezone,datetime
from models.users import User
class User_Input(Document):
    postedDate = DateField(required=True, default=datetime.now(timezone.utc).replace(tzinfo=None))  
    title=StringField(required=True)
    content=StringField(required=True)
    tags=ListField(StringField())
    user=ReferenceField(User)
