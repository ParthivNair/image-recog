# 🎯 Color Blob Detection Dashboard

A full-stack real-time color blob detection system using OpenCV and React. This application captures video from your webcam, detects colored objects (blobs) based on your input, and streams the annotated video to a beautiful web dashboard.

## Features

- 🎥 **Real-time video streaming** from webcam using OpenCV
- 🎨 **Color blob detection** with support for multiple colors (red, blue, green, yellow, orange)
- 🔴 **Visual feedback** with red bounding boxes drawn around detected objects
- 📍 **Position tracking** showing normalized coordinates of detected blobs
- 💬 **Chat-style interface** to dynamically change detection targets
- 📊 **Live status dashboard** showing detection state and position
- 🎨 **Modern, responsive UI** with gradient backgrounds and smooth animations

## Tech Stack

### Backend
- **Python 3** - Core language
- **FastAPI** - High-performance web framework
- **OpenCV** - Computer vision and image processing
- **Uvicorn** - ASGI server
- **NumPy** - Numerical operations

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **JavaScript** - Programming language
- **CSS3** - Styling with modern features

## Project Structure

```
image-recog/
├── backend/
│   ├── main.py           # FastAPI application with endpoints
│   └── detector.py       # Color blob detection logic
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPanel.jsx      # Video stream display
│   │   │   ├── StatusPanel.jsx     # Detection status
│   │   │   ├── ChatInput.jsx       # Control input
│   │   │   └── ControlPanel.jsx    # Right sidebar container
│   │   ├── App.jsx                 # Main app component
│   │   ├── config.js               # API configuration
│   │   └── main.jsx                # React entry point
│   ├── package.json
│   └── vite.config.js
├── requirements.txt       # Python dependencies
└── README.md
```

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 18+ and npm
- A working webcam
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd image-recog
   ```

2. **Create a Python virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Usage

### Starting the Application

1. **Start the backend** (in one terminal):
   ```bash
   # From project root, with venv activated
   uvicorn backend.main:app --reload
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

4. **Grant camera access** when prompted by your browser

### Using the Dashboard

1. **View the live stream**: The left panel shows your webcam feed with detection overlays

2. **Check detection status**: The top-right panel shows:
   - Current target color
   - Detection status (YES/NO)
   - Relative position coordinates (0-1 range)

3. **Change detection target**: Use the chat-style input at the bottom-right:
   - Type commands like "red blob", "blue blob", "green blob"
   - Press Send or hit Enter
   - The system will switch to detecting the specified color
   - Supported colors: **red**, **blue**, **green**, **yellow**, **orange**

4. **Observe detection**: When a blob of the target color is detected:
   - A red bounding box appears around it
   - The status shows "Detected: YES"
   - Relative coordinates are displayed (e.g., (0.52, 0.48) means center of frame)

### Example Commands

- `red blob` - Detect red objects
- `blue blob` - Detect blue objects
- `green blob` - Detect green objects
- `find yellow` - Detect yellow objects
- `show me orange` - Detect orange objects

## How It Works

### Color Detection Algorithm

1. **Capture Frame**: OpenCV captures frames from the webcam
2. **Color Space Conversion**: Frame is converted from BGR to HSV color space
3. **Color Thresholding**: HSV ranges filter pixels matching the target color
4. **Morphological Operations**: Erosion and dilation clean up noise
5. **Contour Detection**: Find connected regions in the binary mask
6. **Blob Selection**: Select the largest contour above a minimum area threshold
7. **Bounding Box**: Calculate and draw a red rectangle around the blob
8. **Position Calculation**: Compute normalized (x, y) coordinates of the centroid
9. **Streaming**: Encode annotated frame as JPEG and stream to frontend

### API Endpoints

- **GET `/`** - Health check
- **GET `/video`** - MJPEG video stream (multipart/x-mixed-replace)
- **GET `/status`** - Current detection status (JSON)
- **POST `/config/target`** - Update target color (JSON body: `{"prompt": "blue blob"}`)

### Frontend Components

- **VideoPanel**: Displays the MJPEG stream in an `<img>` tag
- **StatusPanel**: Polls `/status` endpoint every 500ms to show live data
- **ChatInput**: Sends commands to `/config/target` endpoint
- **ControlPanel**: Container for status and chat components
- **App**: Main layout with gradient background

## Troubleshooting

### Camera Issues

- **Camera not opening**: Make sure no other application is using the webcam
- **Permission denied**: Grant camera access in your browser settings
- **Wrong camera**: Modify `cv2.VideoCapture(0)` in `backend/main.py` to use index 1, 2, etc.

### Connection Issues

- **Cannot connect to backend**: Verify backend is running on port 8000
- **CORS errors**: Check that `http://localhost:5173` is in CORS allowed origins
- **Video not loading**: Check browser console for errors and ensure `/video` endpoint is accessible

### Detection Issues

- **Nothing detected**: Try adjusting lighting or moving object closer
- **False positives**: Modify HSV ranges in `detector.py` for stricter filtering
- **Detection too sensitive**: Increase `min_area` parameter in detection function

## Configuration

### Adjusting Detection Parameters

Edit `backend/detector.py`:

```python
# Adjust HSV color ranges
COLOR_RANGES = {
    "red": [...],  # Modify ranges
    # Add new colors here
}

# Adjust minimum blob size
def detect_color_blob(frame, color_name="red", min_area=500):
    # Increase min_area for larger objects only
```

### Camera Settings

Edit `backend/main.py`:

```python
def get_camera():
    camera = cv2.VideoCapture(0)  # Change index for different camera
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)   # Adjust resolution
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
```

### API Configuration

Edit `frontend/src/config.js`:

```javascript
export const API_BASE_URL = "http://localhost:8000";  // Change if backend runs elsewhere
```

## Building for Production

### Backend

For production deployment, use a production ASGI server:

```bash
pip install gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

Build optimized static files:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and can be served with any static file server.

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- OpenCV for computer vision capabilities
- FastAPI for the excellent web framework
- React and Vite for the modern frontend experience
