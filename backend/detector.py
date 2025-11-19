import cv2
import numpy as np

# HSV color ranges for different colors - More restrictive for better accuracy
# Note: OpenCV uses H: 0-179, S: 0-255, V: 0-255
COLOR_RANGES = {
    "red": [
        # Red wraps around in HSV, so we need two ranges
        # More restrictive - higher saturation to avoid skin tones
        (np.array([0, 120, 70]), np.array([10, 255, 255])),
        (np.array([170, 120, 70]), np.array([180, 255, 255]))
    ],
    "blue": [
        (np.array([100, 150, 70]), np.array([130, 255, 255]))
    ],
    "green": [
        (np.array([40, 100, 70]), np.array([80, 255, 255]))
    ],
    "yellow": [
        (np.array([20, 100, 100]), np.array([35, 255, 255]))
    ],
    "orange": [
        (np.array([10, 150, 100]), np.array([20, 255, 255]))
    ]
}

def calculate_circularity(contour):
    """
    Calculate how circular a contour is (1.0 = perfect circle, lower = less circular)
    Uses the ratio of area to perimeter
    """
    area = cv2.contourArea(contour)
    perimeter = cv2.arcLength(contour, True)
    if perimeter == 0:
        return 0
    circularity = 4 * np.pi * area / (perimeter * perimeter)
    return circularity

def calculate_solidity(contour):
    """
    Calculate solidity (ratio of contour area to convex hull area)
    Helps identify compact vs. irregular shapes
    """
    area = cv2.contourArea(contour)
    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    if hull_area == 0:
        return 0
    return area / hull_area

def detect_color_blob(frame, color_name="red", min_area=1500, min_circularity=0.5, min_solidity=0.7, draw_overlay=False):
    """
    Detect a color blob in the frame with improved shape filtering.
    Optimized for speed - minimal drawing operations.
    
    Args:
        frame: BGR image from OpenCV
        color_name: Name of color to detect (e.g., "red", "blue", "green")
        min_area: Minimum contour area to consider as a valid blob (default: 1500)
        min_circularity: Minimum circularity score 0-1 (1=perfect circle, default: 0.5)
        min_solidity: Minimum solidity score 0-1 (default: 0.7)
        draw_overlay: Whether to draw detection overlays (default: False for speed)
    
    Returns:
        annotated_frame: Frame (only annotated if draw_overlay=True)
        rel_x: Normalized x position (0-1) of blob center, or None
        rel_y: Normalized y position (0-1) of blob center, or None
        detected: Boolean indicating if blob was found
    """
    # Only copy frame if we need to draw on it
    if draw_overlay:
        annotated_frame = frame.copy()
    else:
        annotated_frame = frame
    
    height, width = frame.shape[:2]
    
    # Get color ranges for the specified color
    if color_name.lower() not in COLOR_RANGES:
        return annotated_frame, None, None, False
    
    ranges = COLOR_RANGES[color_name.lower()]
    
    # Convert to HSV (skip Gaussian blur for speed - morphology handles noise)
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Create mask by combining all ranges for this color
    mask = None
    for lower, upper in ranges:
        current_mask = cv2.inRange(hsv, lower, upper)
        if mask is None:
            mask = current_mask
        else:
            mask = cv2.bitwise_or(mask, current_mask)
    
    # Fast morphological operations - minimal iterations
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return annotated_frame, None, None, False
    
    # Filter contours by area, circularity, and solidity
    valid_contours = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        
        circularity = calculate_circularity(contour)
        solidity = calculate_solidity(contour)
        
        # Check if contour meets shape criteria
        if circularity >= min_circularity and solidity >= min_solidity:
            # Calculate a score based on area, circularity, and solidity
            score = area * circularity * solidity
            valid_contours.append((contour, score, circularity, solidity, area))
    
    if not valid_contours:
        # Skip drawing for speed
        return annotated_frame, None, None, False
    
    # Get the best matching contour (highest score)
    best_contour, score, circularity, solidity, area = max(valid_contours, key=lambda x: x[1])
    
    # Calculate centroid using moments (more accurate than bounding box center)
    M = cv2.moments(best_contour)
    if M["m00"] != 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
    else:
        # Fallback to bounding box center
        x, y, w, h = cv2.boundingRect(best_contour)
        cx = x + w // 2
        cy = y + h // 2
    
    # Only draw if requested (for debugging/visualization)
    if draw_overlay:
        x, y, w, h = cv2.boundingRect(best_contour)
        cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.circle(annotated_frame, (cx, cy), 5, (0, 255, 0), -1)
        cv2.putText(annotated_frame, f"{color_name.upper()}", 
                    (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    # Calculate normalized coordinates
    rel_x = cx / width
    rel_y = cy / height
    
    return annotated_frame, rel_x, rel_y, True

