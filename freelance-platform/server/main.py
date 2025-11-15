from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. App Initialization FIRST
app = FastAPI(
    title="Freelance Platform API",
    version="1.0.0",
    description="API for the freelance platform, providing services for jobs, payments, and user authentication."
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://127.0.0.1:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 2. Import Routers (Make sure routes/notifications.py exists)
from routes import users, jobs, applications, payments, messages, reviews, auth, ai, conversation
from routes import protected
from routes import ws_chat
from routes import gigs
from routes.notifications import router as notifications_router  # <-- Make sure this path matches your project!
import models
print("DEBUG: DIR(models):", dir(models))
print("DEBUG: ALL:", getattr(models, "__all__", None))
print("DEBUG: Application present?", hasattr(models, "Application"))

# 3. Import DB Models and Setup
from db.database import engine
from models.base import Base
from models import *  # <- This will import ALL your models, respecting __init__.py order!


# 4. OpenAPI Customization
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": "/auth/login",
                    "scopes": {}
                }
            }
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# 6. Include Routers
print("Registering API routers...")
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(reviews.router)
app.include_router(payments.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(messages.router)
app.include_router(users.router)
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(conversation.router)
app.include_router(ws_chat.router)
app.include_router(gigs.router)
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
print("AI ROUTER REGISTERED IN MAIN")

# 7. Startup Events
@app.on_event("startup")
async def startup_event():
    print("--- Server starting up... ---")
    async with engine.begin() as conn:
        print("Creating database tables if they don't exist...")
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables checked/created.")
    print("🚀 Registered Routes:")
    for route in app.routes:
        if hasattr(route, "methods"):
            methods = ", ".join(route.methods)
            print(f"{route.path} [{methods}] -> {route.name}")
        else:
            print(f"{route.path} -> {route.name}")
    print("--- Startup complete. Server is ready. ---")

# 8. Main Execution Block
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
