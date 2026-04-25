from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ExpenseIQ ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import predict, categorize
app.include_router(predict.router, prefix="/predict")
app.include_router(categorize.router, prefix="/categorize")

@app.get("/")
def root():
    return {"message": "ML service running!"}
