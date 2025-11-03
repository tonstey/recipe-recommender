from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config

import os # FOR CREATING DB LOCALLY

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'dev.db')}"
#database_url = config("DATABASE_URL")

engine = create_engine(url = DATABASE_URL, connect_args={"check_same_thread": False})

SessionMaker = sessionmaker(bind=engine, autoflush=False)


DB_Session = SessionMaker()