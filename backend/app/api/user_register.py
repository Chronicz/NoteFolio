from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from models.users import User
from utils.password_helper import hash_password,verify_password
from schema.users_schema import Users
from pymongo import MongoClient
from db.mongo_db import db
import bcrypt
router=APIRouter()

database=db["Notefolio"]

@router.get('/hello')
async def example():
    return "Hello World"

@router.post('/user-register',response_model=None)
async def create_user(user:Users):
    check_if_user_exists=database.find_one({"email":user.email})
    
    if(check_if_user_exists):
        raise HTTPException(status_code=400, detail="User already registered")
    
    try:
        user.password=hash_password(user.password)

        new_user=User(
            name=user.name,
            email=user.email,
            password=user.password
        )

        result=database.insert_one(new_user.to_dict())

        return {
            "message":"User successfully registered",
            "user":new_user

        }
    
    except HTTPException as e:
        return {
            'error':e.message,
            'error_message':"Wasn't able to create user"
        }

@router.get("/grab-all-users")
async def query_all_users():
    pass

@router.get("/get-specific-user/{id}")
async def find_user(id:int):
    pass

@router.delete("/delete-user/{id}")
async def delete_user(id:int):
    pass

@router.patch("/update-user-info/{id}")
async def update_user(id:int):
    pass