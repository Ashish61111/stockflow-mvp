from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, products, dashboard, settings as settings_router

app = FastAPI(
    title=settings.app_name,
    description="Multi-tenant SaaS Inventory Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(dashboard.router)
app.include_router(settings_router.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to StockFlow API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "StockFlow",
    }
