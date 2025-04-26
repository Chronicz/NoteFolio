from fastapi import FastAPI
from api import user_register
from api import user_login
from api import payment_method
#from api import tokens
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
app=FastAPI()
load_dotenv()

app.include_router(user_register.router)
app.include_router(user_login.router)
app.include_router(payment_method.router)
#app.include_router(tokens.router)