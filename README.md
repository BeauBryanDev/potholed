# PotholeGuard

PotholeGuard is a full-stack computer vision platform for detecting potholes in road images. The backend exposes a FastAPI API for authentication, image inference, detections, analytics, and geospatial export. The frontend is a React + TypeScript dashboard for authentication, scanning, map views, registry management, and operational monitoring.

The ML inference engine uses a fine-tuned YOLOv8 small model exported to ONNX and executed with `onnxruntime`. The project persists users, towns, streets, uploaded images, and detections in PostgreSQL.
![potholeGuard_Icon](./frontend/public/cv_pothole_img.jpg)

## Overview

- Problem solved: detect potholes from road images and persist structured detection records.
- Inference engine: YOLOv8s fine-tuned for pothole detection and exported to ONNX.
- Backend language: Python.
- Frontend language: TypeScript.
- Backend framework: FastAPI.
- Database: PostgreSQL.
- Deployment style: Docker Compose for API + database.
- Frontend tooling: React, Vite, Tailwind CSS, Axios, Recharts, Leaflet.

## Stack

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- OpenCV
- ONNX Runtime
- Pydantic
- JWT auth with `python-jose`

### Frontend

- TypeScript
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- Leaflet / React Leaflet
- React Dropzone

## High-Level Architecture

The system is split into four main layers:

1. Frontend UI
   The React application handles login, dashboard analytics, image upload for inference, registry views, and map-based visualization.

2. API Layer
   FastAPI routers define authentication, CRUD operations, inference endpoints, analytics endpoints, and geospatial detection exports.

3. Service Layer
   Backend services encapsulate inference logic, detection retrieval, analytics queries, and CRUD logic for relational entities.

4. Persistence Layer
   PostgreSQL stores users, towns, streets, images, and detections. Images and annotated outputs are stored on disk.

## Core Domain Model

The project currently revolves around five main relational entities:

- `User`
  Stores authentication and authorization data, including `is_active` and `is_admin`.

- `Town`
  Represents municipalities or cities.

- `Street`
  Belongs to a town and stores segment and geographic endpoint metadata.

- `Image`
  Represents an uploaded image processed by the model. It links to the uploading user, street, and town.

- `Detection`
  Stores pothole count, confidence summary, model version, inference time, coordinates, and raw detection JSON.

## Inference Flow

1. The authenticated user uploads an image through the frontend scanner.
2. The backend validates the file and selected street.
3. The image is decoded with OpenCV.
4. The ONNX model runs inference with `onnxruntime`.
5. Bounding boxes are post-processed with NMS.
6. The original image is stored on disk.
7. The annotated image is saved to `app/storage/outputs`.
8. An `Image` row is inserted into PostgreSQL.
9. A linked `Detection` row is inserted into PostgreSQL.
10. The API returns the annotated image URL and structured detection output.

## Privacy and Authorization Model

- Auth uses JWT bearer tokens.
- Regular users can only access their own images and detections.
- Admin users can access all detections and all images.
- Soft delete is implemented with `is_active = false`.
- Inactive users are blocked from authenticated actions.
- Admin-only routes are enforced in both backend logic and frontend routing.

## Backend Structure

Key backend folders:

- `app/api/routers`
  FastAPI route handlers.
- `app/core`
  Configuration, database bootstrap, security, and logging.
- `app/models`
  SQLAlchemy ORM models.
- `app/schemas`
  Pydantic request/response schemas.
- `app/services`
  Query and business logic.
- `app/utils`
  Helper modules for image processing, geo estimation, and related utilities.
- `alembic`
  Database migration environment and revision history.

## Frontend Structure

Key frontend folders:

- `frontend/src/pages`
  View-level pages such as login, dashboard, scanner, map, and registry.
- `frontend/src/components`
  Shared UI building blocks such as layout, sidebar, protected route, header, and footer.
- `frontend/src/context`
  Global auth context.
- `frontend/src/services`
  Axios API clients for auth, users, analytics, detections, towns, streets, and images.
- `frontend/src/hooks`
  Reusable hooks such as `useAuth`.

## Compact Project Tree

```text
potholed/
├── alembic/
│   ├── env.py
│   └── versions/
├── app/
│   ├── api/
│   │   └── routers/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── storage/
│   │   ├── originals/
│   │   └── outputs/
│   └── utils/
├── frontend/
│   ├── publics/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── ml/
├── pictures/
├── scripts/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Docker Setup

The project uses two containers:

- `potholeguard`
  FastAPI backend container.
- `potholeguard_db`
  PostgreSQL 16 database container.

### `docker-compose.yml`

The compose file does the following:

- builds the backend service from the repository root
- runs FastAPI with `uvicorn app.main:app --reload`
- exposes backend API on `localhost:8000`
- exposes PostgreSQL on host port `5433`
- mounts the repository into the backend container for hot reload
- bind-mounts `./app/storage/outputs` so annotated images are visible on the host filesystem
- persists PostgreSQL data using the `postgres_data` volume

### Start the stack

```bash
docker compose up -d --build
```

### Stop the stack

```bash
docker compose down
```

## Backend API

Swagger UI is available at:

```text
http://localhost:8000/docs
```

### Authentication

- `POST /auth/register`
  Register a new user.
- `POST /auth/login`
  Authenticate a user and return a JWT token.

### Users

- `GET /users/me`
- `PUT /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- Admin endpoints for lookup, creation, update, and deletion of users are also available under `/users`.

### Towns

- `GET /towns/`
- `POST /towns/`
- `GET /towns/{town_id}`
- `PUT /towns/{town_id}`
- `DELETE /towns/{town_id}`

### Streets

- `GET /streets/`
- `POST /streets/`
- `GET /streets/{street_id}`
- `PUT /streets/{street_id}`
- `DELETE /streets/{street_id}`

### Images

- `GET /images/`
- `GET /images/{image_id}`
- `PUT /images/{image_id}`
- `DELETE /images/{image_id}`

### Detections

- `POST /detections/predict`
  Upload image, run ONNX inference, persist image and detection.
- `GET /detections/`
  Admins can view all; regular users only see their own detections.
- `GET /detections/{detection_id}`
- `DELETE /detections/{detection_id}`
- `GET /detections/street/{street_id}/geojson`
- `GET /detections/town/{town_id}/geojson`

### Analytics

- `GET /analytics/`
- `GET /analytics/dashboard/`
- `GET /analytics/top-affected-streets`
- `GET /analytics/towns-distribution`
- `GET /analytics/model-performance`
- `GET /analytics/user-activity`
- `GET /analytics/last-activity`

## Frontend Application

The frontend is a Vite + React + TypeScript application that consumes the backend API through Axios.

### Main user-facing views

- `Login`
  JWT authentication and session bootstrap.
- `Dashboard`
  Operational summary and analytics.
- `YoloScanner`
  Image upload, street selection, inference execution, and annotated result view.
- `IntelMap`
  Map-oriented detection view.
- `DataRegistry`
  Registry management for towns and streets with admin-only controls.

### Frontend routing

The frontend uses:

- public routes for authentication pages
- `ProtectedRoute` for authenticated areas
- `Layout` as the master shell for dashboard and operational modules
- an admin-only route gate for the admin console

## Database

PostgreSQL stores all relational entities and is the source of truth for:

- users
- towns
- streets
- uploaded images
- detection results

### Local connection

From the host machine:

```text
localhost:5433
```

Inside Docker Compose:

```text
db:5432
```

## Image Storage

The backend stores:

- original uploaded images in `app/storage/originals`
- annotated output images in `app/storage/outputs`

Because `app/storage/outputs` is bind-mounted in Docker Compose, annotated files remain available on the host machine even if containers are recreated.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Default dev server:

```text
http://localhost:3000
```

## Running the Backend Locally

If you want to run the API outside Docker:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

You must also provide a valid `.env` file with database and JWT configuration.

## Testing and Utility Scripts

- `tests/`
  Automated backend tests.
- `scripts/test_detection_endpoint.py`
  End-to-end test for the detection endpoint.
- `scripts/check_onnx.py`
  Quick ONNX model inspection utility.

## Logging

The backend includes a colorized CLI logging bootstrap in:

- `app/core/logging.py`

It is initialized from:

- `app/main.py`

The logger supports readable colored output for `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL` levels.

## Current Version

Frontend release target:

- `v1.0.0`

This repository represents the first integrated full-stack version of PotholeGuard, including authentication, detection inference, analytics, image persistence, and operational frontend views.

## Notes

- The training notebook used in Google Colab is not stored in the repository.
- The ONNX model artifact is stored under `ml/`.
- Some future pages are scaffolded and can be expanded as the product evolves.
