import cv2
import time 
import numpy as np
import onnxruntime as ort
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.image import Image
from typing import Optional


class PotholeDetector:
    def __init__(self, model_path: str):
        # Load the ONNX model from ../ml/yolov8s.onnx
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.conf_threshold = 0.4
        self.iou_threshold = 0.32
 
    def predict(self, image_bytes: bytes):
        # Pre-processing 
        # Convert into numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        h, w = img.shape[:2]

        input_img = cv2.resize(img, (640, 640))
        input_img = input_img.astype(np.float32) / 255.0
        input_img = input_img.transpose(2, 0, 1)  # HWC a CHW
        input_img = np.expand_dims(input_img, axis=0)  # CHW a NCHW

        # 3. Inference
        start_inference = time.time()
        outputs = self.session.run([self.output_name], {self.input_name: input_img})
        predictions = np.squeeze(outputs[0])  # De [1, 84, 8400] a [84, 8400]
        predictions = predictions.T # Transponer a [8400, 84]
        end_inference = time.time()
        inference_time = end_inference - start_inference

        inference_time_ms = inference_time * 1000
        print(f"Inferencia en {inference_time_ms:.2f} ms")
        
        # 4. Post-processing
        boxes = []
        confidences = []

        for i in range(len(predictions)):
            # La clase 'pothole' es el índice 4 (después de x,y,w,h)
            prob = predictions[i][4] 
            if prob > self.conf_threshold:
                # Escalar coordenadas de vuelta al tamaño original
                xc, yc, nw, nh = predictions[i][:4]
                x1 = int((xc - nw/2) * (w / 640))
                y1 = int((yc - nh/2) * (h / 640))
                bw = int(nw * (w / 640))
                bh = int(nh * (h / 640))
                
                boxes.append([x1, y1, bw, bh])
                confidences.append(float(prob))

        # Aplicar Non-Maximum Suppression para eliminar cajas duplicadas
        indices = cv2.dnn.NMSBoxes(boxes, confidences, self.conf_threshold, self.iou_threshold)
        
        results = []
        if len(indices) > 0:
            for i in indices.flatten():
                results.append({
                    "box": boxes[i], # [x, y, w, h]
                    "confidence": confidences[i],
                    "class": "pothole"
                })
        
        return results, img, inference_time_ms
    
