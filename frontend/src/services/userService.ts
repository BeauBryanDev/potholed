import api from './api';

export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  name?: string;
  gender?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address?: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  gender?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address?: string;
}


const userService = {

    /* Get Current User Profile */
    /** Obtiene el perfil del usuario actual */
    getMe: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>('/users/me');
        return response.data;
  },
    /* Full Update User Profile */
    updateMe: async (data: UserUpdate): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/users/me', data);
    return response.data;
  },
    /* Partial Update User Profile */
    patchMe: async (data: UserUpdate): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>('/users/me', data);
    return response.data;
  },

  // Admin USer Endpoints 

    /* Create a new User from Admin */
    createByAdmin: async (data: UserUpdate & { username: string; email: string }): Promise<UserResponse> => {
        const response = await api.post<UserResponse>('/users/', data);
        return response.data;
    },
    /* Get all Users from Admin */
    getAllByAdmin: async (): Promise<UserResponse[]> => {
        const response = await api.get<UserResponse[]>('/users/');
        return response.data;
    },
    /** Get a User from Admin */
    getById: async (userId: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

    /** Delete a User from Admin */
    deleteByAdmin: async (userId: number): Promise<{ message: string }> => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    }

};

export default userService;