// hooks/useUserRole.js - Fixed version
import { useState, useEffect, useCallback } from 'react';
import { checkUserRole } from '../service/auth';

export const useUserRole = (isConnected) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckedPrincipal, setLastCheckedPrincipal] = useState(null);

  // Function to refresh user role - dapat dipanggil dari luar
  const refreshUserRole = useCallback(async (forcePrincipal = null) => {
    if (!isConnected && !forcePrincipal) {
      setUserRole(null);
      setLastCheckedPrincipal(null);
      return null;
    }

    setIsLoading(true);
    try {
      const role = await checkUserRole();
      setUserRole(role);
      
      if (forcePrincipal) {
        setLastCheckedPrincipal(forcePrincipal);
      }
      
      console.log('User role determined:', role);
      return role;
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Effect untuk check role saat connection berubah
  useEffect(() => {
    if (isConnected) {
      refreshUserRole();
    } else {
      setUserRole(null);
      setLastCheckedPrincipal(null);
    }
  }, [isConnected, refreshUserRole]);

  // Effect untuk re-check role secara periodik (opsional untuk real-time updates)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (isConnected) {
        refreshUserRole();
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [isConnected, refreshUserRole]);

  return { 
    userRole, 
    isLoading, 
    refreshUserRole,
    lastCheckedPrincipal 
  };
};