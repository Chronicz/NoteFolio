from fastapi import FastAPI
from api import user_register
from api import user_login

app=FastAPI()


app.include_router(user_register.router)
app.include_router(user_login.router)