import api from './api';

/**
 * Interfaces reflecting the Pothole Guard Town Schemas
 */
export interface TownResponse {
  id: number;
  name: string;
  province: string;
  country: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

export interface TownCreate {
  name: string;
  province?: string;
  country?: string;
  code?: string;
}

export interface TownUpdate {
  name?: string;
  province?: string;
  country?: string;
  code?: string;
}

const townService = {
  /**
   * GET /towns/
   * Fetches a paginated list of all registered towns.
   * Accessible by any active user.
   */
  getTowns: async (skip: number = 0, limit: number = 100): Promise<TownResponse[]> => {
    const response = await api.get<TownResponse[]>('/towns/', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * GET /towns/{town_id}
   * Fetches details of a specific town by its ID.
   * Accessible by any active user.
   */
  getTownById: async (townId: number): Promise<TownResponse> => {
    const response = await api.get<TownResponse>(`/towns/${townId}`);
    return response.data;
  },

  /**
   * POST /towns/
   * Creates a new town entity in the system.
   * Requires Administrator privileges.
   */
  createTown: async (townData: TownCreate): Promise<TownResponse> => {
    const response = await api.post<TownResponse>('/towns/', townData);
    return response.data;
  },

  /**
   * PUT /towns/{town_id}
   * Updates an existing town's information.
   * Requires Administrator privileges.
   */
  updateTown: async (townId: number, townData: TownUpdate): Promise<TownResponse> => {
    const response = await api.put<TownResponse>(`/towns/${townId}`, townData);
    return response.data;
  },

  /**
   * DELETE /towns/{town_id}
   * Permanently removes a town from the database.
   * Requires Administrator privileges.
   */
  deleteTown: async (townId: number): Promise<void> => {
    await api.delete(`/towns/${townId}`);
  }
};

export default townService;