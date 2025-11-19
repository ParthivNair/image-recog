from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import threading
from backend.detector import detect_color_blob, COLOR_RANGES

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class AppState:
    def __init__(self):
        self.current_target_color = "red"
        self.last_detected = False
        self.last_rel_x = None
        self.last_rel_y = None
        self.min_area = 1500
        self.min_circularity = 0.5
        self.min_solidity = 0.7
        self.lock = threading.Lock()

state = AppState()

# Camera capture (will be initialized when needed)
camera = None

def get_camera():
    """Get or initialize camera"""
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
        # Optimize for speed
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)  # Max FPS
        camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimal buffer for lower latency
    return camera

def generate_frames():
    """Generator function that yields MJPEG frames"""
    cam = get_camera()
    
    if not cam.isOpened():
        # Return error frame
        error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(error_frame, "Camera not available", (50, 240), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        ret, buffer = cv2.imencode('.jpg', error_frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        return
    
    while True:
        success, frame = cam.read()
        if not success:
            print("Failed to read frame from camera")
            break
        
        # Get current detection parameters safely
        with state.lock:
            target_color = state.current_target_color
            min_area = state.min_area
            min_circularity = state.min_circularity
            min_solidity = state.min_solidity
        
        # Detect color blob with current parameters (no overlay drawing for speed)
        try:
            annotated_frame, rel_x, rel_y, detected = detect_color_blob(
                frame, target_color, min_area, min_circularity, min_solidity, draw_overlay=False
            )
        except Exception as e:
            print(f"Error in detection: {e}")
            annotated_frame = frame
            rel_x, rel_y, detected = None, None, False
        
        # Update state with latest detection
        with state.lock:
            state.last_detected = detected
            state.last_rel_x = rel_x
            state.last_rel_y = rel_y
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue
        
        frame_bytes = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.get("/video")
async def video_feed():
    """Stream video frames as MJPEG"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

class TargetConfig(BaseModel):
    prompt: str

@app.post("/config/target")
async def update_target(config: TargetConfig):
    """Update the target color based on user prompt"""
    prompt = config.prompt.lower()
    
    # Extract color from prompt
    detected_color = None
    for color in COLOR_RANGES.keys():
        if color in prompt:
            detected_color = color
            break
    
    if detected_color is None:
        return {
            "success": False,
            "error": f"Could not identify color. Supported colors: {', '.join(COLOR_RANGES.keys())}"
        }, 400
    
    # Update state
    with state.lock:
        state.current_target_color = detected_color
    
    return {
        "success": True,
        "current_target_color": detected_color,
        "label": f"{detected_color} blob"
    }

@app.get("/status")
async def get_status():
    """Get current detection status"""
    with state.lock:
        return {
            "current_target_color": state.current_target_color,
            "last_detected": state.last_detected,
            "last_rel_x": state.last_rel_x,
            "last_rel_y": state.last_rel_y,
            "min_area": state.min_area,
            "min_circularity": state.min_circularity,
            "min_solidity": state.min_solidity
        }

class SensitivityConfig(BaseModel):
    min_area: int = 1500
    min_circularity: float = 0.5
    min_solidity: float = 0.7

@app.post("/config/sensitivity")
async def update_sensitivity(config: SensitivityConfig):
    """Update detection sensitivity parameters"""
    with state.lock:
        state.min_area = config.min_area
        state.min_circularity = config.min_circularity
        state.min_solidity = config.min_solidity
    
    return {
        "success": True,
        "min_area": config.min_area,
        "min_circularity": config.min_circularity,
        "min_solidity": config.min_solidity
    }

@app.on_event("shutdown")
def shutdown_event():
    """Clean up camera on shutdown"""
    global camera
    if camera is not None:
        camera.release()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "running", "message": "Color blob detection API"}

