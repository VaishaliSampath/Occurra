from fastapi import APIRouter, File, UploadFile, HTTPException
import os
import json
import shutil
from typing import Dict, Any
from models.schemas import AnalysisResponse, ZoneCounts, OccupancyTrendItem
from utils.helpers import get_file_hash
from services.cv_service import CVProcessingService

router = APIRouter()

# Instantiate the CV Service
cv_service = CVProcessingService()

# Cache file path
CACHE_FILE = "outputs/cache.json"

def load_cache() -> Dict[str, Any]:
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache: Dict[str, Any]):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(file: UploadFile = File(...)):
    # Create required folders if they don't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".avi", ".mov"]:
        raise HTTPException(status_code=400, detail="Unsupported video format. Upload .mp4, .avi, or .mov.")
        
    # Save the uploaded file temporarily to compute hash
    temp_path = f"uploads/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Calculate file hash
        file_hash = get_file_hash(temp_path)
        
        # Determine final unique filenames based on hash
        input_filename = f"{file_hash}{ext}"
        input_path = f"uploads/{input_filename}"
        
        # If the file already exists under this hash, we can clean up the temp file
        if not os.path.exists(input_path):
            os.rename(temp_path, input_path)
        else:
            os.remove(temp_path)
            
        # Check cache
        cache = load_cache()
        if file_hash in cache:
            print(f"Video with hash {file_hash} already analyzed. Returning cached results.")
            cached_data = cache[file_hash]
            return AnalysisResponse(
                processedVideo=cached_data["processedVideo"],
                heatmap=cached_data["heatmap"],
                currentOccupancy=cached_data["currentOccupancy"],
                peakOccupancy=cached_data["peakOccupancy"],
                averageOccupancy=cached_data["averageOccupancy"],
                uniquePeople=cached_data["uniquePeople"],
                processingTime=cached_data["processingTime"],
                occupancyTrend=[OccupancyTrendItem(**item) for item in cached_data["occupancyTrend"]],
                zoneCounts=ZoneCounts(**cached_data["zoneCounts"]),
                recommendation=cached_data["recommendation"]
            )
            
        # Define output paths
        output_video_filename = f"processed_{file_hash}.mp4"
        output_video_path = f"outputs/{output_video_filename}"
        heatmap_filename = f"heatmap_{file_hash}.png"
        heatmap_path = f"outputs/{heatmap_filename}"
        
        # Process the video
        print(f"Starting analytics processing for new video {file.filename} (hash: {file_hash})...")
        results = cv_service.analyze_video(input_path, output_video_path, heatmap_path)
        
        # Prepare response paths
        # Relative URLs served by static files
        processed_video_url = f"/outputs/{output_video_filename}"
        heatmap_url = f"/outputs/{heatmap_filename}"
        
        # Compile response
        response_data = {
            "processedVideo": processed_video_url,
            "heatmap": heatmap_url,
            "currentOccupancy": results["currentOccupancy"],
            "peakOccupancy": results["peakOccupancy"],
            "averageOccupancy": results["averageOccupancy"],
            "uniquePeople": results["uniquePeople"],
            "processingTime": results["processingTime"],
            "occupancyTrend": results["occupancyTrend"],
            "zoneCounts": results["zoneCounts"],
            "recommendation": results["recommendation"]
        }
        
        # Update cache
        cache[file_hash] = response_data
        save_cache(cache)
        
        return AnalysisResponse(
            processedVideo=processed_video_url,
            heatmap=heatmap_url,
            currentOccupancy=results["currentOccupancy"],
            peakOccupancy=results["peakOccupancy"],
            averageOccupancy=results["averageOccupancy"],
            uniquePeople=results["uniquePeople"],
            processingTime=results["processingTime"],
            occupancyTrend=[OccupancyTrendItem(**item) for item in results["occupancyTrend"]],
            zoneCounts=ZoneCounts(**results["zoneCounts"]),
            recommendation=results["recommendation"]
        )
        
    except Exception as e:
        # Clean up temp file if it still exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Error during video analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")
