import os
import urllib.request
import sys
import time

# Ensure project root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set folder directory structure
os.makedirs("backend/uploads", exist_ok=True)
os.makedirs("backend/outputs", exist_ok=True)

SAMPLE_VIDEO_URL = "https://github.com/intel-iot-devkit/sample-videos/raw/master/people-detection.mp4"
SAMPLE_VIDEO_PATH = "backend/uploads/sample_people.mp4"

def download_sample_video():
    if os.path.exists(SAMPLE_VIDEO_PATH):
        print(f"Sample video '{SAMPLE_VIDEO_PATH}' already exists.")
        return
        
    print(f"Downloading sample video from: {SAMPLE_VIDEO_URL}...")
    try:
        # User-agent header to avoid bot blockers
        req = urllib.request.Request(
            SAMPLE_VIDEO_URL, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response, open(SAMPLE_VIDEO_PATH, 'wb') as out_file:
            shutil_copy(response, out_file)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download sample video: {e}")
        print("Please place a sample .mp4 video manually at 'backend/uploads/sample_people.mp4'")
        sys.exit(1)

def shutil_copy(src, dst):
    import shutil
    shutil.copyfileobj(src, dst)

def run_test():
    download_sample_video()
    
    # Import and run CV service
    try:
        from services.cv_service import CVProcessingService
    except ImportError as e:
        print(f"Failed to import CV service: {e}. Please ensure ultralytics and opencv are installed.")
        sys.exit(1)
        
    print("\nInitializing Computer Vision Service...")
    cv_service = CVProcessingService()
    
    output_video = "backend/outputs/processed_sample_people.mp4"
    heatmap_image = "backend/outputs/heatmap_sample_people.png"
    
    print("\nRunning analytics processing pipeline (YOLO + ByteTrack + Heatmap)...")
    print("This might take a moment. Processing frame-by-frame...")
    
    start_time = time.time()
    try:
        results = cv_service.analyze_video(SAMPLE_VIDEO_PATH, output_video, heatmap_image)
        duration = time.time() - start_time
        
        print("\n=== PIPELINE RUN COMPLETED SUCCESSFULLY ===")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Processed Video Saved: {output_video} (Exists: {os.path.exists(output_video)})")
        print(f"Heatmap Overlay Saved: {heatmap_image} (Exists: {os.path.exists(heatmap_image)})")
        print("\n--- Analytics Results ---")
        import pprint
        pprint.pprint(results)
        
    except Exception as e:
        print(f"\nProcessing failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
