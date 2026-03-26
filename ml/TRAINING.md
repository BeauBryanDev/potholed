# ML Training Documentation

This document describes the training workflow used to produce the pothole detection model deployed in this repository.

The source training notebook is:

- `ml/potholes_model.ipynb`

The exported inference artifact used by the backend is:

- `ml/pothole_model.onnx`

Supporting training artifacts in this folder:

- `ml/training_results.csv`
- `ml/results.png`
- `ml/confusion_matrix .png`

## Goal

Train a YOLOv8 small model for single-class pothole detection and export the final model to ONNX for CPU-friendly inference inside the FastAPI backend.

## Training Environment

The notebook was written for Google Colab and uses:

- Google Drive mount for persistent experiment outputs
- Roboflow for dataset download in YOLOv8 format
- Ultralytics YOLO for training and validation
- ONNX export for deployment

The notebook explicitly checks CUDA availability and prints the active GPU name and VRAM. Based on the notebook and your correction, the model was trained on a Google Colab T4 GPU workflow and trained for `50` epochs, not `60`.

## Dataset Acquisition

The notebook downloads the dataset from Roboflow:

- workspace: `landebeau7`
- project: `pothole-clzln-nnz7l`
- version: `2`
- export format: `yolov8`

Notebook snippet summary:

- installs `ultralytics`, `supervision`, and `roboflow`
- mounts Google Drive
- creates a base experiment folder under `/content/drive/MyDrive/potholesv1`
- downloads the dataset using Roboflow

## Base Model

The training starts from the pretrained Ultralytics checkpoint:

```python
model = YOLO("yolov8s.pt")
```

This means the project uses transfer learning rather than training from scratch.

## Training Configuration

The primary training call in the notebook is:

- model: `yolov8s.pt`
- epochs: `50`
- image size: `640`
- batch size: `48`
- patience: `15`
- device: `0`
- workers: `8`
- optimizer: `auto`
- cosine LR schedule: `True`
- AMP mixed precision: `True`
- single class mode: `True`

### Data augmentation settings

- `mosaic = 1.0`
- `mixup = 0.3`
- `copy_paste = 0.15`
- `hsv_h = 0.015`
- `hsv_s = 0.7`
- `hsv_v = 0.4`
- `degrees = 5.0`
- `translate = 0.1`
- `scale = 0.6`
- `shear = 2.0`
- `perspective = 0.0001`
- `flipud = 0.4`
- `fliplr = 0.4`
- `bgr = 0.0`
- `close_mosaic = 10`

### Output directory in Colab

The main training run stores artifacts under:

```text
/content/drive/MyDrive/potholesv1/train_run_9k
```

The notebook also references additional checkpoints and experiments such as:

- `train_run_9k2`
- `finetune_run_v1`

That indicates the notebook was used iteratively across multiple runs and comparisons, not only a single clean execution.

## Training Results

The CSV file `ml/training_results.csv` shows the tracked metrics across 50 epochs.

### Final epoch metrics

From epoch `50`:

- Precision: `0.78594`
- Recall: `0.68724`
- mAP@50: `0.75603`
- mAP@50-95: `0.41697`
- Validation box loss: `1.65776`
- Validation cls loss: `1.11198`
- Validation DFL loss: `1.61611`

### Best metrics observed in the CSV

The best `mAP@50` and `mAP@50-95` in the provided CSV both occur at epoch `50`:

- Best mAP@50: `0.75603`
- Best mAP@50-95: `0.41697`

This suggests the run continued improving through the end of the 50-epoch schedule.

## Validation and Comparison Cells

The notebook contains validation and comparison sections beyond the initial training run:

- `model.val()` on validation data
- metric printing for:
  - `mAP50`
  - `mAP50-95`
  - `Precision`
  - `Recall`
- baseline vs fine-tuned model comparison

The notebook also compares:

- a baseline model loaded from `BEST_PT`
- a fine-tuned model loaded from `finetune_run_v1/weights/best.pt`

This indicates the training workflow was used not only to train but also to benchmark different checkpoints.

## Export for Deployment

The notebook exports to ONNX in two places.

The more deployment-oriented export uses:

```python
finetuned.export(
    format="onnx",
    imgsz=640,
    simplify=True,
    opset=12,
)
```

This is aligned with the backend inference stack:

- OpenCV for image preprocessing
- ONNX Runtime for model execution
- FastAPI for API serving

## Inference Demonstration Inside the Notebook

The notebook includes an inference section that:

- loads the best trained checkpoint
- scans images from `/content/potholes/`
- runs prediction
- draws red bounding boxes
- overlays confidence labels
- displays the results for visual inspection

This section is useful for manual qualitative validation of the trained model before deployment.

## Deployment Relationship

The model training and deployment chain is:

1. Fine-tune `yolov8s.pt` in Google Colab.
2. Validate and compare trained checkpoints.
3. Export the selected model to ONNX.
4. Commit or copy the ONNX artifact into `ml/pothole_model.onnx`.
5. Load the ONNX model from the backend inference service.
6. Run prediction through `onnxruntime` inside FastAPI.

## Reproducibility Notes

This notebook is reproducible in structure, but not fully portable without updating a few environment-specific details:

- Google Drive mount path is hardcoded.
- Roboflow download is hardcoded to a specific workspace/project/version.
- The notebook currently contains a hardcoded Roboflow API key.
- Some later cells refer to multiple experiment folders (`train_run_9k`, `train_run_9k2`, `finetune_run_v1`), so the notebook reflects iterative experimentation rather than a single fully cleaned final script.

## Security Note

The notebook currently includes a plaintext Roboflow API key. That should be treated as a secret and removed or rotated if the repository is public.

Recommended fix:

- move secrets to Colab environment variables or a private secrets manager
- avoid hardcoding API keys directly in notebooks

## Recommended Future Improvements

- Split training, validation, comparison, and export into separate notebook sections or scripts.
- Save a formal experiment manifest with:
  - dataset version
  - hyperparameters
  - checkpoint path
  - best metrics
  - ONNX export settings
- Track experiments with a tool such as MLflow, Weights & Biases, or a structured CSV/JSON manifest.
- Add a dedicated backfill note documenting which checkpoint exactly produced `ml/pothole_model.onnx`.
- Remove hardcoded secrets from the notebook.

## Summary

The deployed pothole detector was trained through a Google Colab YOLOv8 workflow using transfer learning on `yolov8s.pt`, single-class pothole detection, and 50 epochs of training at `640x640`. The exported ONNX model is the deployment artifact consumed by the FastAPI backend. The provided training CSV shows the run reaching its best validation `mAP@50` and `mAP@50-95` at epoch 50, with final metrics of:

- Precision: `0.78594`
- Recall: `0.68724`
- mAP@50: `0.75603`
- mAP@50-95: `0.41697`
