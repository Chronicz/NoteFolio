from mongoengine import Document,StringField,DateField,DateTimeField,ListField, ReferenceField
from datetime import timezone,datetime
class User_Input(Document):
    title = StringField(required=True)
    content = StringField(required=True)
    tags = ListField(StringField())
    user=ReferenceField("User")


    def to_dict(self):
        return {
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
        }
