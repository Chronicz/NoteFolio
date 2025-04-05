from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from mongoengine import connect
import os

load_dotenv()
mongo_username=os.getenv("MONGO_USERNAME") # Replace with your mongo_username in .env
mongo_password=os.getenv("MONGO_PASSWORD") # Replace with your mongo_password in .env

uri=f"mongodb+srv://{mongo_username}:{mongo_password}@notefolio.93liglm.mongodb.net/?retryWrites=true&w=majority&appName=Notefolio"
client=MongoClient(uri,server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connect yo MongoDB, Happy Hacking")
    connect(
        db="Notefolio",
        host=uri
    )

except Exception as e:
    print(f"Unable to connect to MongoDB, error:{e}")