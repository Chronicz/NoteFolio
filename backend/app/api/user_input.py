from fastapi import APIRouter, HTTPException, Depends, Request, Response,status
from bson import ObjectId   
from schema.user_input_schema import User_Inputs,User_Input_Update
from models.user_input import User_Input
from db.mongo_db import db

router=APIRouter()
database=db["Notefolio"]    

@router.post("/notes",response_model=None)
async def create_note(note:User_Inputs):
    new_note=User_Input(
        title=note.title,
        content=note.content,
        tags=note.tags,
        postedDate=note.postedDate
    )

    result=database.insert_one(new_note.to_dict())

    return {
        "message":f"Note successfully created{result}",
        "note_title":new_note["title"],
        "note_content":new_note["content"],
        "note_tags":new_note["tags"],
        "note_postedDate":new_note["postedDate"]
    }

@router.get("/notes")
async def query_all_notes():
    find_all_notes=list(database.find({}))

    if not find_all_notes:
        raise HTTPException(status_code=404,detail="No notes in the db")
    
    return [serialize_note(notes) for notes in find_all_notes]

def serialize_note(note):
    return {
        "note_title":note["title"],
        "note_content":note["content"],
        "note_tags":note["tags"],
        "note_postedDate":note["postedDate"]
    }

@router.delete("/notes/{id}")
async def delete_note(id:str):
    user_id=ObjectId(id)
    find_note_to_delete=database.find_one({"_id":user_id})

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
        "note_postedDate":find_note_to_delete["postedDate"]
    }

@router.patch("/notes/{id}")
async def update_note(id:str,note_update:User_Input_Update):
    user_id=ObjectId(id)
    find_note_to_update=database.find_one({"_id":user_id})

    if not find_note_to_update:
        raise HTTPException(status_code=400,detail="Id field not provided")
    
    result=database.update_one({"_id":user_id},{"$set":note_update})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Couldn't update the note")
    
    return{
        "message":"Successfully updated note",
        "note_title":result["title"],
        "note_content":result["content"],
        "note_tags":result["tags"],
        "note_postedDate":result["postedDate"]
    }