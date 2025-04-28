from fastapi import APIRouter, HTTPException
from bson import ObjectId
from db.mongo_db import db  # Assuming you have a MongoDB connection setup
from schema.payment_schema import Payment_Methods,Payment_Methods_Update

router=APIRouter()
database=db["Notefolio"]

@router.post("/create-payment-method/{user_id}")
async def create_payment_method(user_id: str, payment_method: Payment_Methods):

    try:
        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)
        if(not user_object_id):
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create a new payment method document
        new_payment_method = {
            "payment_card": payment_method.payment_card,
            "card_user": payment_method.card_user,
            "zip_code": payment_method.zip_code,
            "ccv": payment_method.ccv,
            "payment_type": payment_method.payment_type,
            "expiration_date": payment_method.expiration_date,
            "user": user_object_id
        }
        
        # Insert the new payment method into the database
        result = database.insert_one(new_payment_method)
        if(result):
            return {
                "message": "Payment method successfully created",
                "payment_method_id": str(result.inserted_id)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create payment method")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-payment-method/{user_id}")
async def get_payment_method(user_id: str):
    try:
        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)
        if(not user_object_id):
            raise HTTPException(status_code=404, detail="User not found")
        
        # Find the payment method for the given user
        payment_method = database.find_one({"user": user_object_id})
        
        if payment_method:
            return {
            "payment_card": payment_method["payment_card"],
            "card_user": payment_method["card_user"],
            "zip_code": payment_method["zip_code"],
            "ccv": payment_method["ccv"],
            "payment_type": payment_method["payment_type"],
            "expiration_date": payment_method["expiration_date"]
        }
        else:           
            raise HTTPException(status_code=404, detail="Payment method not found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/update-payment-method/{user_id}")
async def update_payment_method(user_id: str, payment_method: Payment_Methods_Update):
    try:
        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)
        if(not user_object_id):
            print("No user object id")
            raise HTTPException(status_code=404, detail="User not found")
        
        user_exists = database.find_one({"user": user_object_id})
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update the payment method for the given user
        update_data = {key: value for key, value in payment_method.dict().items() if value is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = database.update_one(
            {"user": user_object_id},
            {"$set": update_data}
        )
        print(result)
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Payment method not found or no changes made")
        else:
            return {"message": "Payment method successfully updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))