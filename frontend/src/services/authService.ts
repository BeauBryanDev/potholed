import api from './api';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  gender?: string;
  phone_number?: string;
  city?: string;
  country?: string;
  address?: string;
}

const authService = {
  /**
   * POST /auth/login
   * Authenticates a user and retrieves a JWT access token.
   * FastAPI's OAuth2 implementation requires URLSearchParams.
   */
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post<TokenResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  /**
   * POST /auth/register
   * Registers a new user in the system.
   */
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Clears the authentication token from local storage.
   */
  logout: (): void => {
    localStorage.removeItem('token');
  }
};

export default authService;