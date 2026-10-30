from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import session, speech, cognitive, predict, users
from config import settings

app = FastAPI(title="Early Dementia Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(speech.router)
app.include_router(cognitive.router)
app.include_router(predict.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Dementia Detection API is running"}
