from fastapi import FastAPI
from database import initialize

app = FastAPI()

@app.get("/")
def home():
  return {"message": "HELLO WORLD"}