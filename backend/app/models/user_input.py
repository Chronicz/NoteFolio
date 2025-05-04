from mongoengine import Document,StringField,DateField,DateTimeField,ListField, ReferenceField
from datetime import timezone,datetime
class User_Input(Document):
    postedDate = DateTimeField(default=datetime.utcnow)
    title = StringField(required=True)
    content = StringField(required=True)
    tags = ListField(StringField())




