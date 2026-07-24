# 9
import cv2
import numpy as np
import time
import os
from typing import Dict, Any, List
from ultralytics import YOLO
from utils.helpers import ensure_openh264

# Ensure H.264 DLL is downloaded and present on Windows
ensure_openh264()

class CVProcessingService:
    def __init__(self):
        # Load YOLO model. We use YOLOv8n/YOLO11n person detector.
        # Ultralytics will auto-download the weight file if it is not present.
        try:
            # Try loading YOLO11n (latest)
            self.model = YOLO("yolo11m.pt")
            print("Loaded YOLO11m detector.")
        except Exception as e:
            print(f"YOLO11m load failed: {e}. Falling back to YOLOv8n.")
            self.model = YOLO("yolov8n.pt")

    def analyze_video(self, video_path: str, output_video_path: str, heatmap_path: str) -> Dict[str, Any]:
        start_time = time.time()

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Read the first frame for heatmap background
        ret, first_frame = cap.read()
        if ret:
            # Keep first frame copy, reset capture
            first_frame_copy = first_frame.copy()
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        else:
            first_frame_copy = np.zeros((height, width, 3), dtype=np.uint8)
            
        # Try to use H.264 (avc1) first, fallback to mp4v if it fails
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))
        
        if not out.isOpened():
            print("Warning: avc1 codec initialization failed. Falling back to mp4v.")
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

        # Heatmap accumulator (float array initialized to zero)
        heatmap_accum = np.zeros((height, width), dtype=np.float32)
        
        # State tracking
        unique_people = set()
        left_ids = set()
        center_ids = set()
        right_ids = set()
        
        frame_counts = []
        all_frame_occupancy = []
        
        frame_idx = 0
        zone_width = width // 3
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_idx += 1
            # Skip 2 out of every 3 frames for much faster processing
            
            if frame_idx % 30 == 0:
                print(f"Processing frame {frame_idx}/{total_frames}")
            
            # Track people using ByteTrack (class 0 is person in COCO)
            # persist=True maintains IDs across frames
            results = self.model.track(
    frame,
    persist=True,
    tracker="bytetrack.yaml",
    classes=[0],
    conf=0.15,
    iou=0.45,
    imgsz=1280,
    verbose=False
)
            
            current_count = 0
            
            if results and results[0].boxes is not None and results[0].boxes.id is not None:
                boxes = results[0].boxes
                xyxy = boxes.xyxy.cpu().numpy()
                ids = boxes.id.cpu().numpy().astype(int)
                confidences = boxes.conf.cpu().numpy()
                
                current_count = len(ids)
                current_left = 0
                current_center = 0
                current_right = 0
                
                for box, track_id, conf in zip(xyxy, ids, confidences):
                    x1, y1, x2, y2 = map(int, box)
                    cx = (x1 + x2) // 2
                    cy = (y1 + y2) // 2
                    
                    # Accumulate tracking ID sets
                    unique_people.add(track_id)
                    
                    # Allocate to zones
                    if cx < zone_width:
                        current_left += 1
                        zone_name = "Left"
                        zone_color = (255,100,100)

                    elif cx < 2 * zone_width:
                        current_center += 1
                        zone_name = "Center"
                        zone_color = (100,255,100)

                    else:
                        current_right += 1
                        zone_name = "Right"
                        zone_color = (100,100,255)
                        
                    # Add to heatmap accumulator
                    # Draw a solid circle centered at the person's feet/center with intensity
                    cv2.circle(heatmap_accum, (cx, cy), radius=25, color=5.0, thickness=-1)
                    
                    # Draw bounding box and label on the output frame
                    # Color matches their zone for visual intelligence
                    cv2.rectangle(frame, (x1, y1), (x2, y2), zone_color, 2)
                    label = f"ID: {track_id} ({zone_name})"
                    cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, zone_color, 2)
                    
            # Draw Zone division boundaries
            cv2.line(frame, (zone_width, 0), (zone_width, height), (200, 200, 200), 1, cv2.LINE_AA)
            cv2.line(frame, (2 * zone_width, 0), (2 * zone_width, height), (200, 200, 200), 1, cv2.LINE_AA)
            
            # Draw Labels for Zones
            cv2.putText(frame, "LEFT ZONE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
            cv2.putText(frame, "CENTER ZONE", (zone_width + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
            cv2.putText(frame, "RIGHT ZONE", (2 * zone_width + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Show live occupancy count on top right corner
            cv2.putText(frame, f"Occupancy: {current_count}", (width - 180, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)
            
            # Write annotated frame
            out.write(frame)
            
            # Record trend
            all_frame_occupancy.append(current_count)
            
            # Downsample trend data to 1 point per second of video
            if frame_idx % int(fps) == 0 or frame_idx == total_frames:
                seconds = int(frame_idx / fps)
                minutes = seconds // 60
                sec_rem = seconds % 60
                time_str = f"{minutes:02d}:{sec_rem:02d}"
                frame_counts.append({
                    "time": time_str,
                    "occupancy": current_count
                })

        cap.release()
        out.release()
        cv2.destroyAllWindows()
        # Handle heatmap image generation
        # Blur the accumulator to create smooth crowd-density blending
        if np.max(heatmap_accum) > 0:
            heatmap_blur = cv2.GaussianBlur(heatmap_accum, (51, 51), 0)
            # Normalize to 0-255
            heatmap_norm = np.zeros_like(heatmap_blur)
            cv2.normalize(heatmap_blur, heatmap_norm, 0, 255, cv2.NORM_MINMAX)
            heatmap_img = np.uint8(heatmap_norm)
            # Apply color map
            color_heatmap = cv2.applyColorMap(heatmap_img, cv2.COLORMAP_JET)
            
            # Blend colormap with the first frame (semi-transparent overlay)
            # Make sure sizes match
            if first_frame_copy.shape != color_heatmap.shape:
                first_frame_copy = cv2.resize(first_frame_copy, (width, height))
            heatmap_overlay = cv2.addWeighted(first_frame_copy, 0.5, color_heatmap, 0.5, 0)
        else:
            heatmap_overlay = first_frame_copy.copy()
            
        cv2.imwrite(heatmap_path, heatmap_overlay)
        
        # Compute final statistics
        end_time = time.time()
        processing_duration = round(end_time - start_time, 2)
        
        unique_count = len(unique_people)
        peak_occ = max(all_frame_occupancy) if all_frame_occupancy else 0
        avg_occ = int(np.mean(all_frame_occupancy)) if all_frame_occupancy else 0
        
        # Dynamic AI Recommendations
        left_count = len(left_ids)
        center_count = len(center_ids)
        right_count = len(right_ids)
        
        total_zone_visits = left_count + center_count + right_count
        
        if avg_occ > 18 or peak_occ > 30:
            recommendation = (
                "Critical crowd density detected. Recommend opening secondary entrance counters "
                "and dispatching staff to manage flow."
            )
        elif total_zone_visits > 0 and (center_count / max(1, total_zone_visits)) > 0.55 and unique_count > 10:
            recommendation = (
                "High lane bottleneck in Center Zone. Recommend directing visitor flow to "
                "the Left and Right auxiliary lanes using floor markings."
            )
        elif avg_occ >= 5:
            recommendation = (
                "Moderate and healthy occupancy levels observed. Maintain standard operations."
            )
        else:
            recommendation = (
                "Low crowd density. Optimal operating conditions. No actions required."
            )
            
        return {
            "currentOccupancy": all_frame_occupancy[-1] if all_frame_occupancy else 0,
            "peakOccupancy": peak_occ,
            "averageOccupancy": avg_occ,
            "uniquePeople": unique_count,
            "processingTime": processing_duration,
            "occupancyTrend": frame_counts if frame_counts else [{"time": "00:00", "occupancy": 0}],
            "zoneCounts": {
                "left": current_left,
                "center": current_center,
                "right": current_right
            },
            "recommendation": recommendation
        }
