from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database.initialize import engine, Base
from routers import users, recipes, pantry, ratings

from decouple import config

limiter = Limiter(key_func=get_remote_address, default_limits=["3/second"])
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Base.metadata.create_all(bind=engine)

app.add_middleware(CORSMiddleware, allow_origins=[config("FRONTEND_URL")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(users.router)
app.include_router(pantry.router)
app.include_router(recipes.router)
app.include_router(ratings.router)


@app.get("/health")
def health():
    return {"status": "ok"}