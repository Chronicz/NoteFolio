import bcrypt
from bson import ObjectId

def hash_password(password:str)->str:
    salt=bcrypt.gensalt()
    hashed=bcrypt.hashpw(password.encode("utf-8"),salt)
    return hashed.decode("utf-8")

def verify_password(stored_password:str,input_password:str)->bool:
    return bcrypt.checkpw(input_password.encode("utf-8"),stored_password.encode("utf-8"))

def str_objectid(id: ObjectId) -> str:
    return str(id)
