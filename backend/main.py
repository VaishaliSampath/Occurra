from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uvicorn
from routers.analytics import router as analytics_router

# Create folders on load
os.makedirs("backend/uploads", exist_ok=True)
os.makedirs("backend/outputs", exist_ok=True)

app = FastAPI(
    title="Occurra API",
    description="AI Powered Intelligent Occupancy Analytics System API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount outputs directory as static folder to serve videos and images
app.mount("/outputs", StaticFiles(directory="backend/outputs"), name="outputs")

# Include the analytics router
app.include_router(analytics_router, tags=["Analytics"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Occurra AI Powered Intelligent Occupancy Analytics",
        "model": "YOLO11n (person-tracking)"
    }

if __name__ == "__main__":
    # Start the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
