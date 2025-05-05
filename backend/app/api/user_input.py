from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from bson import ObjectId   
from schema.user_input_schema import User_Inputs,User_Input_Update
from models.user_input import User_Input
from db.mongo_db import db

router=APIRouter()
database=db["Notefolio"]    

@router.post("/notes/{user_id}",response_model=None)
async def create_note(user_id:str,note:User_Inputs):
    user_object_id=ObjectId(user_id)
    if(not user_object_id):
            raise HTTPException(status_code=404, detail="User not found")
    
    new_note= {
            "title": note.title,
            "content": note.title,
            "tags": note.tags,
            "user":user_object_id
        }
            
    result=database.insert_one(new_note)
    
    if not result:
        raise HTTPException(status_code=500,detail="Failed to create note")

    return {
        "message":f"Note successfully created{result}",
        "note_id":str(result.inserted_id)
    }

@router.get("/get-notes/{user_id}")
async def query_all_notes(user_id:str):
    user_object_id=ObjectId(user_id)
    if(not user_object_id):
            raise HTTPException(status_code=404, detail="User not found")
    
    find_all_notes=list(database.find({}))

    if not find_all_notes:
        raise HTTPException(status_code=404,detail="No notes in the db")
    
    return [serialize_note(notes) for notes in find_all_notes]

def serialize_note(note):
    return {
        "note_title": note.get("title", ""),
        "note_content": note.get("content", ""),
        "note_tags": note.get("tags", []),
    }


@router.delete("/delete-note/{user_id}/{id}")
async def delete_note(user_id:str,id:str):
    user_id=ObjectId(id)
    if not user_id:
        raise HTTPException(status_code=404,detail="Couldn't find user to delete")
    
    if not id:
        raise HTTPException(status_code=404,detail="Couldn't find note to delete")
    find_note_to_delete=database.find_one({"_id":id})

    if not find_note_to_delete:
        raise HTTPException(status_code=404,detail="Couldn't find note to delete")

    delete_result=database.delete_one({"_id":user_id})
    if delete_result.deleted_count ==0:
        raise HTTPException(status_code=500,detail="Failed to delete note")
    
    return{
        "message":"Successfully deleted note",
        "note_title":find_note_to_delete["title"],
        "note_content":find_note_to_delete["content"],
        "note_tags":find_note_to_delete["tags"],
    }

@router.patch("/update-notes/{id}")
async def update_note(id: str, note_update: User_Input_Update):
    note_id = ObjectId(id)

    find_note_to_update = database.find_one({"_id": note_id})
    if not find_note_to_update:
        raise HTTPException(status_code=400, detail="Id field not provided")

    result = database.update_one(
        {"_id": note_id},
        {"$set": note_update.dict(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Couldn't update the note")

    updated_note = database.find_one({"_id": note_id})
    return {
        "message": "Successfully updated note",
        "note_title": updated_note["title"],
        "note_content": updated_note["content"],
        "note_tags": updated_note["tags"],
    }
