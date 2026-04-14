from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings
from app.core.limiter import limiter
from app.routes import weather, soil, predict, auth, contact, crops
from app.database.db import engine, Base

# rate limiting
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from slowapi.middleware import SlowAPIMiddleware


# Create database tables
Base.metadata.create_all(bind=engine)

# initialize rate limiter
def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )

app = FastAPI(
    title="FarmIQ API",
    description="AI-powered crop recommendation system",
    version="1.0.0"
)

# attach limiter
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(soil.router, prefix="/api/soil", tags=["Soil"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(contact.router, prefix="/api", tags=["Contact"])
app.include_router(crops.router, prefix="/api", tags=["Crops"])


@app.get("/")
async def root():
    return {
        "message": "FarmIQ API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
