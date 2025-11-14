from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import weather, soil, predict

app = FastAPI(
    title="Smart Crop Advisor API",
    description="AI-powered crop recommendation system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(soil.router, prefix="/api/soil", tags=["Soil"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])


@app.get("/")
async def root():
    return {
        "message": "Smart Crop Advisor API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
