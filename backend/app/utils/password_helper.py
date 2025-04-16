import bcrypt
from bson import ObjectId
from passlib.context import CryptContext


def hash_password(password:str)->str:
    salt=bcrypt.gensalt()
    hashed=bcrypt.hashpw(password.encode("utf-8"),salt)
    return hashed.decode("utf-8")

def verify_password(input_password:str,hashed_password:str)->bool:
    pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
    return pwd_context.verify(input_password,hashed_password)

def str_objectid(id: ObjectId) -> str:
    return str(id)
