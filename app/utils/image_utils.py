import os
import uuid
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np

# Base directory for saving images
OUTPUT_DIR = "app/storage/outputs"
ORIGINAL_DIR = "app/storage/originals"

# make sure the directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ORIGINAL_DIR, exist_ok=True)


def save_original_upload(filename: str | None, image_bytes: bytes) -> tuple[str, str]:
    """
    Persist the uploaded file and return the generated filename and relative path.
    """
    source_name = filename or "upload.jpg"
    suffix = Path(source_name).suffix or ".jpg"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    stored_name = f"orig_{timestamp}_{unique_id}{suffix}"
    filepath = os.path.join(ORIGINAL_DIR, stored_name)

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return stored_name, filepath

def draw_potholes_and_save(image: np.ndarray, detections: list) -> str:
    """
        Draws red boxes and confidence text over the image and saves it to disk.

        Args:

        image (np.ndarray): The original image in OpenCV (BGR) format.

        detections (list): List of dicts containing 'box' [x, y, w, h] and 'confidence'.

        Returns:

        str: The name of the saved file or its relative path.
        
    """

    output_img = image.copy()
    overlay = image.copy()

    neon_red =  (0,0, 255)
    
    for det in detections:
        x, y, w, h = det["box"]
        conf = det["confidence"]
        label = f"Pothole: {conf:.2f}"
        

        cv2.rectangle(overlay, (x, y), (x + w, y + h), (neon_red), -1)
        cv2.addWeighted(overlay, 0.5, output_img, 0.5, 0, output_img)

        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(overlay, (x, y - 20), (x + text_w, y), (neon_red), -1)

        cv2.putText(overlay, label, (x, y - 5), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)


    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"det_{timestamp}_{unique_id}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)


    cv2.imwrite(filepath, output_img)
    
    return filename


def draw_potholes_and_save2(image: np.ndarray, detections: list) -> str:

    output_img = image.copy()
    overlay = image.copy()  # Capa para manejar las transparencias
    
    color_neon = (0, 0, 255)  # Rojo sólido (BGR)
    
    for det in detections:
        x, y, w, h = det["box"]
        conf = det["confidence"]
        label = f"Pothole {conf:.2f}"
        
        cv2.rectangle(overlay, (x, y), (x + w, y + h), color_neon, -1)
        
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(overlay, (x, y - text_h - 10), (x + text_w + 10, y), color_neon, -1)
        
        thickness = 2
        line_length = int(min(w, h) * 0.2)  
        
        cv2.line(output_img, (x, y), (x + line_length, y), color_neon, thickness)
        cv2.line(output_img, (x, y), (x, y + line_length), color_neon, thickness)
        cv2.line(output_img, (x + w, y), (x + w - line_length, y), color_neon, thickness)
        cv2.line(output_img, (x + w, y), (x + w, y + line_length), color_neon, thickness)
        # Bottom-Left
        cv2.line(output_img, (x, y + h), (x + line_length, y + h), color_neon, thickness)
        cv2.line(output_img, (x, y + h), (x, y + h - line_length), color_neon, thickness)
        # Bottom-Right
        cv2.line(output_img, (x + w, y + h), (x + w - line_length, y + h), color_neon, thickness)
        cv2.line(output_img, (x + w, y + h), (x + w, y + h - line_length), color_neon, thickness)

    alpha = 0.2  
    cv2.addWeighted(overlay, alpha, output_img, 1 - alpha, 0, output_img)
    

    for det in detections:
        x, y, w, h = det["box"]
        conf = det["confidence"]
        label = f"Pothole {conf:.2f}"
        cv2.putText(output_img, label, (x + 5, y - 5), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)


    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"det_{timestamp}_{unique_id}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)

    cv2.imwrite(filepath, output_img)

    return filename
