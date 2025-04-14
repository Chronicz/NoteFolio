from fastapi import FastAPI
from api import user_register

app=FastAPI()



app.include_router(user_register.router)