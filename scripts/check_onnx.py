import onnxruntime as ort
session = ort.InferenceSession("../ml/pothole_model.onnx")
print(f"Inputs: {[i.name for i in session.get_inputs()]}")
print(f"Outputs: {[o.name for o in session.get_outputs()]}")
