import argparse
import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
import requests

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.utils.image_utils import OUTPUT_DIR, draw_potholes_and_save


def login(base_url: str, username: str, password: str) -> str:
    
    response = requests.post(
        
        f"{base_url}/auth/login",
        data={"username": username, "password": password},
        timeout=30,
        
    )
    
    response.raise_for_status()
    
    payload = response.json()
    
    token = payload.get("access_token")
    
    if not token:
        
        raise RuntimeError("Login succeeded but no access_token was returned")
    
    return token


def predict(base_url: str, token: str, image_path: Path) -> requests.Response:
    
    with image_path.open("rb") as image_file:
        
        return requests.post(
            
            f"{base_url}/detections/predict",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (image_path.name, image_file, "image/jpeg")},
            timeout=120,
            
        )


def save_local_postprocessed_image(image_path: Path, detections: list[dict]) -> str:
    
    image_bytes = image_path.read_bytes()
    image_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    
    if image is None:
        
        raise RuntimeError(f"Unable to decode image: {image_path}")
    
    generated_name = draw_potholes_and_save(image, detections)
    source_path = os.path.join(OUTPUT_DIR, generated_name)
    overlay_name = f"test_overlay_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}.jpg"
    target_path = os.path.join(OUTPUT_DIR, overlay_name)
    os.replace(source_path, target_path)
    return overlay_name


def main() -> int:
    
    parser = argparse.ArgumentParser(
        
        description="Test the /detections/predict endpoint with an authenticated upload.",
    )
    
    parser.add_argument(
        
        "--base-url",
        default="http://localhost:8000",
        help="API base URL. Default: http://localhost:8000",
    )
    
    parser.add_argument(
        
        "--image",
        required=True,
        help="Path to the image file to upload.",
    )
    
    parser.add_argument(
        
        "--token",
        help="Existing bearer token. If omitted, --username and --password are required.",
    )
    
    parser.add_argument("--username", help="Username or email for /auth/login.")
    parser.add_argument("--password", help="Password for /auth/login.")
    
    args = parser.parse_args()

    image_path = Path(args.image)
    
    if not image_path.is_file():
        
        raise FileNotFoundError(f"Image file not found: {image_path}")

    token = args.token
    
    if not token:
        
        if not args.username or not args.password:
            
            parser.error("Provide --token or both --username and --password")
            
        token = login(args.base_url.rstrip("/"), args.username, args.password)
        

    response = predict(args.base_url.rstrip("/"), token, image_path)

    print(f"Status: {response.status_code}")
    
    try:
        
        payload = response.json()
        
    except ValueError:
        
        print(response.text)
        
        return 1

    print(json.dumps(payload, indent=2))

    if response.ok:
        
        local_output = save_local_postprocessed_image(
            image_path,
            payload.get("detections", []),
        )
        
        print(
            "Persisted IDs:",
            f"image_id={payload.get('image_id')}",
            f"detection_id={payload.get('detection_id')}",
        )
        print(f"Local post-processed image saved as: {local_output}")
        return 0

    return 1




if __name__ == "__main__":
    
    raise SystemExit(main())
