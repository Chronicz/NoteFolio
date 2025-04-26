from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from schema.users_schema import UpdateUser,UserLogin
from utils.password_helper import hash_password,verify_password
from schema.users_schema import Users,UpdateUser
from passlib.context import CryptContext
from pymongo import MongoClient
from db.mongo_db import db
from utils.jwt_helper import create_access_token,create_refresh_token
from bson import ObjectId

router=APIRouter()
database=db["Notefolio"]

@router.post("/login-user")
async def login_user(user:UserLogin):
    find_user=database.find_one({"email":user.email})

    print(find_user)
    user_password=verify_password(user.password,find_user["password"])

    print(f"{user_password}")

    if not find_user or not user_password:
        raise HTTPException(status_code=404, detail="Incorrect password or email")
    try:
        user_id=str(find_user["_id"])
        access_token=create_access_token(data={"sub":user_id})
        refresh_token=create_refresh_token(data={"sub":user_id})

        return{
            "user_email":find_user["email"],
            "name":find_user["name"],
            "access_token":access_token,
            "refresh_token":refresh_token,
            "message":"Sucessfully loggined in "
        }
    except HTTPException as e:
        return {
            'error':e.message,
            'error_message':"Wasn't able to create user"
        }

@router.post("/sign-out")
async def sign_out(response:Response,request:Request):
    try:
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token") #remove the access token and refresh token from the cookies

        return{
            "message":"Successfully signed out"
        }
    except HTTPException as e:
        raise HTTPException(status_code=500, detail="An error occurred during sign-out")