import cv2
import os
import uuid
from datetime import datetime
import numpy as np

# Base directory for saving images
OUTPUT_DIR = "app/storage/outputs"

# make sure the directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
    
    for det in detections:
        x, y, w, h = det["box"]
        conf = det["confidence"]
        label = f"Pothole: {conf:.2f}"
        

        cv2.rectangle(output_img, (x, y), (x + w, y + h), (0, 0, 255), 2)

        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(output_img, (x, y - 20), (x + text_w, y), (0, 0, 255), -1)

        cv2.putText(output_img, label, (x, y - 5), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)


    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"det_{timestamp}_{unique_id}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)


    cv2.imwrite(filepath, output_img)
    
    return filename
