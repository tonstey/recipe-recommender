from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.initialize import engine, Base
from routers import users, recipes, pantry

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(users.router)
app.include_router(pantry.router)
app.include_router(recipes.router)

@app.get("/")
def home():
  return {"message": "HELLO WORLD"}