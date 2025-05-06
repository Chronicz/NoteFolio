from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
#from pymongo.server_api import ServerApi
from pymongo.server_api import ServerApi
#from mongoengine import connect
import os

load_dotenv()
mongo_username=os.getenv("MONGO_USERNAME") # Replace with your mongo_username in .env
mongo_password=os.getenv("MONGO_PASSWORD") # Replace with your mongo_password in .env

uri=f"mongodb+srv://{mongo_username}:{mongo_password}@notefolio.93liglm.mongodb.net/?retryWrites=true&w=majority&appName=Notefolio"
#uri = f"mongodb://{mongo_username}:{mongo_password}@notefolio-shard-00-00.93liglm.mongodb.net:27017,notefolio-shard-00-01.93liglm.mongodb.net:27017,notefolio-shard-00-02.93liglm.mongodb.net:27017/?ssl=true&replicaSet=atlas-93liglm-shard-0&authSource=admin&retryWrites=true&w=majority"

client=MongoClient(uri,server_api=ServerApi('1'))

db=client["Notefolio"]

if(db is not None):
    print("Connected")
else:
    print("Unable to connect to the db")

print(db.list_collection_names())