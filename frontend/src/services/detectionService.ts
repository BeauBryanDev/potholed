import api from './api';

/**
 * GeoJSON Standard Interfaces
 */
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [Longitude, Latitude]
  };
  properties: {
    detection_id: number;
    pothole_count: number;
    confidence_avg: number;
    severity: "high" | "medium";
    detected_at: string;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  metadata: {
    street_id?: number;
    town_id?: number;
    total_potholes: number;
  };
  features: GeoJSONFeature[];
}

/**
 * Interface for the Prediction Response
 */
export interface DetectionPredictResponse {
  image_id: number;
  detection_id: number;
  message: string;
  image_url: string;
  potholes_found: number;
  detections: any[];
  inference_time_ms: number;
  estimated_lat: number;
  estimated_lon: number;
  saved_as: string;
}

const detectionService = {

  /**
   * GET /detections/
   * Fetches a list of detections. The backend automatically filters 
   * based on the JWT token (Admin sees all, User sees own).
   */
  getDetections: async (skip: number = 0, limit: number = 100): Promise<any[]> => {
    const response = await api.get<any[]>('/detections/', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Uploads an image for pothole detection.
   * Uses multipart/form-data to send the file and location metadata.
   */
  predictPotholes: async (
    file: File, 
    streetId: number = 1, 
    currentSegment: number = 5
  ): Promise<DetectionPredictResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('street_id', streetId.toString());
    formData.append('current_segment', currentSegment.toString());

    const response = await api.post<DetectionPredictResponse>(
      '/detections/predict', 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  /**
   * Fetches GeoJSON data for all potholes in a specific street.
   * Ideal for Leaflet or Mapbox integration.
   */
  getStreetGeoJSON: async (streetId: number): Promise<GeoJSONFeatureCollection> => {
    const response = await api.get<GeoJSONFeatureCollection>(
      `/detections/street/${streetId}/geojson`
    );
    return response.data;
  },

  /**
   * Fetches GeoJSON data for all potholes in a specific town/city.
   */
  getTownGeoJSON: async (townId: number): Promise<GeoJSONFeatureCollection> => {
    const response = await api.get<GeoJSONFeatureCollection>(
      `/detections/town/${townId}/geojson`
    );
    return response.data;
  },

  /**
   * Deletes a specific detection record (Admin only).
   */
  deleteDetection: async (detectionId: number): Promise<void> => {
    await api.delete(`/detections/${detectionId}`);
  }
};

export default detectionService;