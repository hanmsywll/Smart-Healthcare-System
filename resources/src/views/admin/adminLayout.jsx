import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Header from '../../components_global/header';
import { initializeAuth, getPrincipal, getActor, loginInternetIdentity, logout } from '../../service/auth'; // Adjust path
import {
  Squares2X2Icon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { HospitalProvider, useHospitals } from "@/context/hospitalContext";

function AdminLayout() {
  const [authState, setAuthState] = useState({
    principal: null,
    actor: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing auth...');
        const isAuth = await initializeAuth();
        console.log('Auth initialized, isAuthenticated:', isAuth);
        if (isAuth) {
          const principalId = getPrincipal();
          const actorInstance = getActor();
          console.log('Principal:', principalId, 'Actor:', actorInstance);
          if (principalId && actorInstance) {
            setAuthState({ principal: principalId, actor: actorInstance, isLoading: false, error: null });
            // Debug: Periksa data dokter setelah autentikasi
            const doctors = await actorInstance.getDoctors();
            console.log('Doctors from backend:', doctors);
          } else {
            setAuthState({ principal: null, actor: null, isLoading: false, error: 'Failed to retrieve principal or actor' });
          }
        } else {
          console.log('No active session found');
          setAuthState({ principal: null, actor: null, isLoading: false, error: null });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState({ principal: null, actor: null, isLoading: false, error: error.message || 'Authentication initialization failed' });
      }
    };
    init();
  }, []);

  const handleConnectWallet = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      console.log('Attempting to connect wallet...');
      await loginInternetIdentity();
      const principalId = getPrincipal();
      const actorInstance = getActor();
      if (principalId && actorInstance) {
        console.log('Login successful, principal:', principalId);
        setAuthState({ principal: principalId, actor: actorInstance, isLoading: false, error: null });
        // Debug: Periksa data dokter setelah login
        const doctors = await actorInstance.getDoctors();
        console.log('Doctors from backend after login:', doctors);
      } else {
        throw new Error('Failed to retrieve principal or actor');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet. Please try again.',
      }));
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      console.log('Disconnecting wallet...');
      await logout();
      setAuthState({ principal: null, actor: null, isLoading: false, error: null });
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error.message || 'Failed to disconnect wallet',
      }));
    }
  };


  return (
    <HospitalProvider actor={authState.actor} principal={authState.principal}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header
            principal={authState.principal}
            isConnecting={authState.isLoading}
            onConnectWallet={handleConnectWallet}
            onDisconnectWallet={handleDisconnectWallet}
          />
          <main className="flex-1 p-6">
            {/* Halaman seperti Dashboard & Patients akan muncul di sini */}
            <Outlet />
          </main>
        </div>
      </div>
    </HospitalProvider>
  );
}

export default AdminLayout;