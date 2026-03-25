import api from './api';

/**
 * Interfaces reflecting the Pothole Guard Street Schemas
 */
export interface StreetResponse {
  id: number;
  name: string;
  segment?: string;
  town_id: number;
  latitude_start?: number;
  longitude_start?: number;
  latitude_end?: number;
  longitude_end?: number;
  created_at: string;
  updated_at: string;
}

export interface StreetCreate {
  name: string;
  town_id: number;
  segment?: string;
  latitude_start?: number;
  longitude_start?: number;
  latitude_end?: number;
  longitude_end?: number;
}

export interface StreetUpdate {
  name?: string;
  town_id?: number;
  segment?: string;
  latitude_start?: number;
  longitude_start?: number;
  latitude_end?: number;
  longitude_end?: number;
}

const streetService = {
  /**
   * GET /streets/
   * Fetches a paginated list of streets. 
   * Can be optionally filtered by townId to load dependent dropdowns.
   */                              
  getStreets: async (skip: number = 0, limit: number = 100, townId?: number): Promise<StreetResponse[]> => {
    const response = await api.get<StreetResponse[]>('/streets/', {
      params: { 
        skip, 
        limit,   // manage optional parameters in the request
        ...(townId && { town_id: townId }) // Only attach town_id if it's provided
      }
    });
    return response.data;
  },

  /**
   * GET /streets/{street_id}
   * Fetches details of a specific street by its ID, including its coordinate bounds.
   */
  getStreetById: async (streetId: number): Promise<StreetResponse> => {
    const response = await api.get<StreetResponse>(`/streets/${streetId}`);
    return response.data;
  },

  /**
   * POST /streets/
   * Creates a new street entity linked to a specific town.
   * Requires Administrator privileges.
   */
  createStreet: async (streetData: StreetCreate): Promise<StreetResponse> => {
    const response = await api.post<StreetResponse>('/streets/', streetData);
    return response.data;
  },

  /**
   * PUT /streets/{street_id}
   * Updates an existing street's information, useful for calibrating GPS coordinates.
   * Requires Administrator privileges.
   */
  updateStreet: async (streetId: number, streetData: StreetUpdate): Promise<StreetResponse> => {
    const response = await api.put<StreetResponse>(`/streets/${streetId}`, streetData);
    return response.data;
  },

  /**
   * DELETE /streets/{street_id}
   * Permanently removes a street from the database.
   * Requires Administrator privileges.
   */
  deleteStreet: async (streetId: number): Promise<void> => {
    await api.delete(`/streets/${streetId}`);
  }
};

export default streetService;