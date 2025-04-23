from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from models.users import User
from utils.password_helper import hash_password,verify_password
from schema.users_schema import Users,UpdateUser
from pymongo import MongoClient
from db.mongo_db import db
from bson import ObjectId

router=APIRouter()
database=db["Notefolio"]

def serialize_user(user):
    user["_id"] = str(user["_id"])
    return user

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
            "message":f"User successfully registered{result}",
            "user_name":new_user["name"],
            "user_email":new_user["email"]
        }
    
    except HTTPException as e:
        return {
            'error':e.message,
            'error_message':"Wasn't able to create user"
        }

@router.get("/grab-all-users")
async def query_all_users():
    find_all_users=list(database.find({}).limit(5))

    if not find_all_users:
        raise HTTPException(status_code=404,detail="No users in the db")
    
    return [serialize_user(users) for users in find_all_users]

@router.get("/get-specific-user/{id}")
async def find_user(id:str):
    try:
        user_id=ObjectId(id)

        find_certain_user= database.find_one({"_id":user_id})

        if(not find_certain_user):
            raise HTTPException(status_code=404,detail="User doesn't exist")
        
        return {
            "message":"Successfully found user",
            "name":find_certain_user["name"],
            "email":find_certain_user["email"],
        }
    
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {ve}")
    
    except TypeError as te:
        raise HTTPException(status_code=400, detail=f"Type error: {te}")
    
    except Exception as e:
        # Catch any unexpected error
        return {
            "message":e.detail,
            "custom_message":"Error in getting the user"
        }

@router.delete("/delete-user/{id}")
async def delete_user(id:str):
    user_id=ObjectId(id)
    find_user_to_delete=database.find_one({"_id":user_id})

    if not find_user_to_delete:
        raise HTTPException(status_code=404,detail="Couldn't find user to delete")

    delete_result=database.delete_one({"_id":user_id})
    if delete_result.deleted_count ==0:
        raise HTTPException(status_code=500,detail="Failed to delete user")
    
    return{
        "message":"Successfully deleted user",
        "name":find_user_to_delete["name"],
        "email":find_user_to_delete["email"]
    } 

@router.patch("/update-user-info/{id}")
async def update_user(id:int,user_update:UpdateUser):
    user_id=ObjectId(id)
    find_user_to_update=database.find_one({"_id":user_id})

    if not find_user_to_update:
        raise HTTPException(status_code=400,detail="Id field not provided")
    
    result=database.update_one({"_id":user_id},{"$set":user_update})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Couldn't update the user")
    
    return{
        "message":"Successfully updated user info",
        "name":result["name"],
        "email":result["email"]
    }