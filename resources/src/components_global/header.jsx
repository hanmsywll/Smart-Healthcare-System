import React, { useState } from 'react';
import { Cog6ToothIcon, BellIcon, UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

const Header = ({ principal, isConnecting, onConnectWallet, onDisconnectWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Tentukan judul kiri tergantung halaman
  let leftContent;
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    leftContent = (
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 105 5a7 7 0 0012 12z" />
        </svg>
        <input
          type="text"
          placeholder="Search anything"
          className="bg-transparent focus:outline-none text-sm text-gray-700"
        />
      </div>
    );
  } else {
    // Make title from enpoint
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    const endpoint = pathSegments[pathSegments.length - 1] || 'Dashboard';
    const title = endpoint.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())
    leftContent = <h1 className="text-2xl font-semibold text-gray-800">{title || 'Dashboard'}</h1>;

  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {leftContent}

        <div className="flex items-center space-x-4">
          {/* Settings Button */}
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
          
          {/* Notifications Button */}
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <BellIcon className="w-6 h-6" />
            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Authentication Section */}
          {!principal ? (
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="px-4 py-2 bg-[#A2F2EF] text-gray-800 rounded-lg font-medium hover:bg-[#8EEAE7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4" />
                  Login with Internet Identity
                </>
              )}
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 sm:px-4 px-2 py-2  sm:bg-gray-100 rounded-lg sm:hover:bg-gray-200 transition-colors no-bg"
              >
                {/* Avatar */}
                <div className="m-0 sm:me-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {principal.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                
                {/* Principal Info */}
                <div className="text-left md:block hidden me-2">
                  <div className="font-medium text-gray-800 text-sm">
                    {formatAddress(principal)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Internet Identity
                  </div>
                </div>
                
                {/* Dropdown Arrow */}
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform sm:block hidden ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">Connected Wallet</div>
                      <div className="text-xs text-gray-600 break-all mt-1">
                        {principal}
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(principal);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Copy Principal ID
                      </button>
                      
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Account Settings
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={() => {
                          onDisconnectWallet();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;