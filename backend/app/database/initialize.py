from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from pymongo import MongoClient

from decouple import config
import os # FOR CREATING DB LOCALLY

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'dev.db')}"
#database_url = config("DATABASE_URL")

engine = create_engine(url = DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit =False, autoflush=False)
Base = declarative_base()

def get_db():
  try:
    db = SessionLocal()
    yield db
  finally:
    db.close()


MONGODB_URL = config("MONGODB_URL")
client = MongoClient(MONGODB_URL)
mongo_db = client["recipe_data"]
ingredient_db = mongo_db["ingredients"]
recipe_db = mongo_db["recipes"]