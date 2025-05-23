from fastapi import FastAPI
from api import user_register
from api import user_login
from api import payment_method
from api import user_input
#from api import tokens
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

app=FastAPI()

origins = [
    "http://localhost:3000",  # or whatever your frontend URL is
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

app.include_router(user_register.router)
app.include_router(user_login.router)
app.include_router(payment_method.router)
app.include_router(user_input.router)
#app.include_router(tokens.router)