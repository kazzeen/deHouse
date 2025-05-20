import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet } from './WalletContext';
import databaseService from './DatabaseService';

// Create a context for user state
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isConnected, walletAddress } = useWallet();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-login when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      loginUser();
    } else if (!isConnected) {
      // Clear user data when wallet disconnects
      setCurrentUser(null);
    }
  }, [isConnected, walletAddress]);

  // Login user with connected wallet
  const loginUser = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await databaseService.loginUser(walletAddress);
      
      if (result.success) {
        setCurrentUser(result.user);
        console.log('[UserContext] User logged in:', result.user);
      } else {
        setError(result.error || 'Failed to login');
        console.error('[UserContext] Login error:', result.error);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('[UserContext] Login exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!walletAddress || !currentUser) {
      setError('You must be logged in to update your profile');
      return { success: false, error: 'Not logged in' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await databaseService.updateUserProfile(walletAddress, profileData);
      
      if (result.success) {
        setCurrentUser(result.user);
        console.log('[UserContext] Profile updated:', result.user);
      } else {
        setError(result.error || 'Failed to update profile');
        console.error('[UserContext] Update profile error:', result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setError(errorMsg);
      console.error('[UserContext] Update profile exception:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user (just clears the state, actual logout happens when wallet disconnects)
  const logoutUser = () => {
    setCurrentUser(null);
    console.log('[UserContext] User logged out');
  };

  // Check if user is logged in
  const isLoggedIn = !!currentUser;

  // Admin wallet address
  const ADMIN_WALLET_ADDRESS = "Fh9CjFZ3gvFfbNVLViYFxxPNM52XWbYgEeuLp2qoVC2T";

  // Context value
  const value = {
    currentUser,
    isLoading,
    error,
    isLoggedIn,
    loginUser,
    logoutUser,
    updateProfile,
    isAdmin: walletAddress === ADMIN_WALLET_ADDRESS // Check if current wallet is admin wallet
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};