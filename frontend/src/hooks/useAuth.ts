import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to consume the global authentication state.
 * Must be used within an <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  
  return context;
};