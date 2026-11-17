from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, dataset

app = FastAPI(
    title="EduStat API",
    description="Educational Data Statistical Analysis Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"message": "EduStat API is running"}


@app.get("/api/health")
def health():
    return {"status": "healthy", "application": "EduStat"}
