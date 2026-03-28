from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from pymongo import MongoClient

from decouple import config
from pathlib import Path
import pickle
import os # FOR CREATING DB LOCALLY


# BEGIN SETUP LOCAL DATABASE
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = config("DATABASE_URL", default=f"sqlite:///{os.path.join(BASE_DIR, 'dev.db')}")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autocommit =False, autoflush=False)
Base = declarative_base()

def get_db():
  try:
    db = SessionLocal()
    yield db
  finally:
    db.close()
# END

# BEGIN SETUP MONGODB DATABASE
MONGODB_URL = config("MONGODB_URL")
client = MongoClient(MONGODB_URL)
mongo_db = client["recipe_data"]
ingredient_db = mongo_db["ingredients"]
recipe_db = mongo_db["recipes"]
# END


with open(Path(__file__).resolve().parent.parent / "ipynbs" / "data.pkl", 'rb') as file:
   recipe_scores = pickle.load(file)