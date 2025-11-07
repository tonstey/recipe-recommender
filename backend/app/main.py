from fastapi import FastAPI
from database.initialize import engine, Base
from routers import users, recipes, pantry

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(pantry.router)
app.include_router(recipes.router)

@app.get("/")
def home():
  return {"message": "HELLO WORLD"}