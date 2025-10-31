import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/nav'; // Adjust path as needed
import { initializeAuth, getPrincipal, getActor, loginInternetIdentity, logout } from '../../service/auth'; // Adjust path as needed
import { useUserRole } from '../../hooks/useUserRole'; 

export const PublicLayoutContext = createContext();

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [authState, setAuthState] = useState({
    principal: null,
    actor: null,
    isLoading: true,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user role using the hook
  const { userRole, isLoading: roleLoading, refreshUserRole } = useUserRole(!!authState.principal);

  // Initialize authentication on mount
  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await initializeAuth();
        if (isAuth) {
          const principalId = getPrincipal();
          const actorInstance = getActor();
          if (principalId && actorInstance) {
            setAuthState({ principal: principalId, actor: actorInstance, isLoading: false });
          } else {
            setAuthState({ principal: null, actor: null, isLoading: false });
          }
        } else {
          setAuthState({ principal: null, actor: null, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState({ principal: null, actor: null, isLoading: false });
      }
    };
    init();
  }, []);

  // FIXED: Force refresh role ketika location berubah
  useEffect(() => {
    if (authState.principal && !authState.isLoading) {
      console.log('Location changed, refreshing user role...', location.pathname);
      refreshUserRole();
    }
  }, [location.pathname, authState.principal, authState.isLoading, refreshUserRole]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await loginInternetIdentity();
      const principalId = getPrincipal();
      const actorInstance = getActor();

      if (principalId && actorInstance) {
        setAuthState({ principal: principalId, actor: actorInstance, isLoading: false });

        console.log('Waiting for role to be determined...');
        const role = await refreshUserRole(principalId);
        
        if (role === 'doctor') {
          console.log('Redirecting to doctor dashboard');
          navigate('/doctor');
        } else if (role === 'hospital') {
          console.log('Redirecting to hospital dashboard');
          navigate('/admin');
        } else {
          console.log('No role found, staying on current page');
        }
      } else {
        throw new Error('Failed to retrieve principal or actor');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await logout();
      setAuthState({ principal: null, actor: null, isLoading: false });
      navigate('/'); 
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Handle role refresh (can be called from child components)
  const handleRefreshUserRole = async () => {
    console.log('Refreshing user role from PublicLayout...');
    const newRole = await refreshUserRole(authState.principal);
    console.log('Role refreshed to:', newRole);
    return newRole;
  };

  // FIXED: Helper functions dengan role detection yang benar
  const getDashboardRoute = () => {
    console.log('getDashboardRoute called with role:', userRole);
    if (userRole === 'doctor') return '/doctor';
    if (userRole === 'hospital') return '/admin';
    return '/admin'; 
  };
  
  const getDashboardLabel = () => {
    if (userRole === 'doctor') return 'Doctor Dashboard';
    if (userRole === 'hospital') return 'Hospital Dashboard';
    return 'Dashboard';
  };

  // Context value to share with child components
  const contextValue = {
    // Auth state
    principal: authState.principal,
    actor: authState.actor,
    isLoading: authState.isLoading,
    isConnected: !!authState.principal,
    
    // Role state
    userRole,
    roleLoading,
    refreshUserRole: handleRefreshUserRole,
    
    // Auth actions
    onConnectWallet: handleConnectWallet,
    onDisconnectWallet: handleDisconnectWallet,
    
    // Helper functions
    formatPrincipal: (principal) => {
      if (!principal) return '';
      return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
    },
    
    getDashboardRoute,
    getDashboardLabel
  };

  return (
    <PublicLayoutContext.Provider value={contextValue}>
      <Navbar
        isScrolled={false} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen} 
        isConnected={!!authState.principal}
        principal={authState.principal}
        isLoading={authState.isLoading}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        // Pass additional role data to Navbar
        userRole={userRole}
        roleLoading={roleLoading}
        getDashboardRoute={getDashboardRoute}
        getDashboardLabel={getDashboardLabel}
      />
      <main className="pt-16 min-h-[calc(100vh-120px)]">
        <Outlet context={{
          principal: authState.principal, 
          actor: authState.actor,
          ...contextValue 
        }} />
      </main>
    </PublicLayoutContext.Provider>
  );
};

// Hook to use the PublicLayout context
export const usePublicLayoutContext = () => {
  const context = useContext(PublicLayoutContext);
  if (!context) {
    throw new Error('usePublicLayoutContext must be used within PublicLayout');
  }
  return context;
};

export default PublicLayout;