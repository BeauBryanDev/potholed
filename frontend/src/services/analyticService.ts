import api from './api';

/**
 * Interface for basic Key Performance Indicators (KPIs)
 */
export interface GeneralOverview {
  total_potholes: number;
  average_confidence: number;
}

/**
 * Interface for street-specific statistics
 */
export interface StreetStat {
  street: string;
  town: string;
  count: number;
}

/**
 * Interface for town/municipality distribution
 */
export interface TownStat {
  town: string;
  count: number;
}

export interface DashboardMetrics {
  overview: GeneralOverview;
  charts: {
    top_streets: StreetStat[];
    towns_distribution: TownStat[];
    severity_distribution: SeverityDistribution;
  };
}

/**
 * Interface for pothole severity categories
 */
export interface SeverityDistribution {
  small: number;
  medium: number;
  large: number;
}

/**
 * Interface for AI model performance metrics
 */
export interface ModelPerformance {
  model_version: string;
  avg_inference_time: number;
  avg_confidence: number;
  total_detections: number;
}

/**
 * Interface for user-related activity stats
 */
export interface UserActivity {
  username: string;
  detections_count: number;
  last_active: string;
}

const analyticsService = {
  /**
   * GET /analytics/dashboard
   * Full consolidated metrics for the main HUD view
   */
  getDashboardMetrics: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  /**
   * GET /analytics/top-affected-streets
   * Ranking of streets with the highest pothole counts
   */
  getTopStreets: async (limit: number = 5): Promise<StreetStat[]> => {
    const response = await api.get<StreetStat[]>('/analytics/top-affected-streets', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * GET /analytics/towns-distribution
   * Pothole distribution grouped by town/city
   */
  getTownsDistribution: async (): Promise<TownStat[]> => {
    const response = await api.get<TownStat[]>('/analytics/towns-distribution');
    return response.data;
  },

  /**
   * GET /analytics/model-performance
   * Statistics on AI precision and inference speed (YOLOv8 ONNX)
   */
  getModelPerformance: async (): Promise<ModelPerformance[]> => {
    const response = await api.get<ModelPerformance[]>('/analytics/model-performance');
    return response.data;
  },

  /**
   * GET /analytics/user-activity
   * Statistics on how active each user has been
   */
  getUserActivity: async (): Promise<UserActivity[]> => {
    const response = await api.get<UserActivity[]>('/analytics/user-activity');
    return response.data;
  },

  /**
   * GET /analytics/last-activity
   * Specific statistics from the last week of detections
   */
  getLastWeekStats: async () => {
    const response = await api.get('/analytics/last-activity');
    return response.data;
  }
};

export default analyticsService;