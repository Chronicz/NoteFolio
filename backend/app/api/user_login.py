from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from schema.users_schema import UpdateUser,UserLogin
from utils.password_helper import hash_password,verify_password
from schema.users_schema import Users,UpdateUser
from passlib.context import CryptContext
from pymongo import MongoClient
from db.mongo_db import db
from bson import ObjectId
import bcrypt
router=APIRouter()

database=db["Notefolio"]

def serialize_user(user):
    user["_id"] = str(user["_id"])
    return user

@router.post("/login-user")
def login_user(user:UserLogin):
    find_user=database.find_one({"email":user.email})

    user_password=verify_password(user.password,find_user["password"])
    print(user_password)

    if not find_user or not user_password:
        raise HTTPException(status_code=404, detail="Incorrect password or email")
    
    return{
        "user_email":find_user["email"],
        "name":find_user["name"],
        "message":"Sucessfully loggined in "
    }


