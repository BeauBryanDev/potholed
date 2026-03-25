import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import userService, { UserResponse } from '../services/userService';


interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context with an undefined initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Verifies the current token and fetches user data.
   */
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Fetch profile using the userService we created earlier
        const userData = await userService.getMe();
        setUser(userData);
      } catch (error) {
        // If token is invalid or expired, clean up
        console.error('[Auth] Token validation failed');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    
    setIsLoading(false);
  };

  // Run the authentication check once when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Authenticates the user, stores the JWT, and fetches profile data.
   */
  const login = async (username: string, password: string) => {
    const data = await authService.login(username, password);
    localStorage.setItem('token', data.access_token);
    await checkAuth(); // Load user profile immediately after login
  };

  /**
   * Logs out the user and clears state.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

