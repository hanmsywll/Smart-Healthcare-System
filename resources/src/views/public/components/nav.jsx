import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import logo1 from "/logo1.png"; 

const Navbar = ({
  isScrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  isConnected,
  principal,
  isLoading,
  onConnectWallet,
  onDisconnectWallet,
  userRole,
  roleLoading,
  getDashboardRoute,
  getDashboardLabel
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navKey, setNavKey] = useState(0);
  
  useEffect(() => {
    setNavKey(prev => prev + 1);
    console.log('Navbar re-rendered due to location/role change:', {
      pathname: location.pathname,
      userRole,
      roleLoading,
      isConnected
    });
  }, [location.pathname, userRole, roleLoading, isConnected]);

  const handleNavigation = (route) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const formatPrincipal = (principal) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  // FIXED: Determine apakah harus show dashboard link
  const shouldShowDashboard = isConnected && userRole && !roleLoading;
  const dashboardRoute = shouldShowDashboard ? getDashboardRoute() : '#';
  const dashboardLabel = shouldShowDashboard ? getDashboardLabel() : 'Dashboard';

  console.log('Navbar render state:', {
    isConnected,
    userRole,
    roleLoading,
    shouldShowDashboard,
    dashboardRoute,
    dashboardLabel
  });

  return (
    <nav key={navKey} className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Main Navigation Bar */}
      <div className="bg-transparant backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation('/')}>
              <img
                src={logo1}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-2xl font-bold text-gray-900">Medly</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Navigation Pills */}
              <div className="flex items-center space-x-1">
                <Link 
                  to="/" 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === '/' 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/buy" 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === '/buy' 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Buy
                </Link>
                
                {/* Dashboard Navigation Pill - FIXED: Show berdasarkan kondisi yang benar */}
                {shouldShowDashboard && (
                  <Link 
                    to={dashboardRoute}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      location.pathname === dashboardRoute
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {dashboardLabel}
                  </Link>
                )}

                {/* Show loading indicator when role is being checked */}
                {isConnected && roleLoading && (
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A2F2EF] mr-2"></div>
                    Loading role...
                  </div>
                )}
              </div>

              {/* Wallet Section */}
              <div className="flex items-center space-x-3">
                {!isConnected ? (
                  <button
                    onClick={onConnectWallet}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] hover:from-[#8EEAE7] hover:to-[#7AE7E4] text-gray-900 px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* User Principal Display with Role Badge */}
                    <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{formatPrincipal(principal)}</span>
                      
                      {/* FIXED: Role badge dengan kondisi yang tepat */}
                      {userRole && !roleLoading && (
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                          userRole === 'doctor' 
                            ? 'bg-blue-200 text-blue-900' 
                            : userRole === 'hospital'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {userRole}
                        </span>
                      )}
                      
                      {roleLoading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-600"></div>
                      )}
                    </div>
                    
                    {/* Disconnect Button */}
                    <button
                      onClick={onDisconnectWallet}
                      className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/buy"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === '/buy' 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Buy
              </Link>
              
              {/* Mobile Dashboard Link - FIXED: Show berdasarkan kondisi yang benar */}
              {shouldShowDashboard && (
                <Link 
                  to={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === dashboardRoute
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {dashboardLabel}
                </Link>
              )}

              {/* Mobile Loading Indicator */}
              {isConnected && roleLoading && (
                <div className="block w-full text-left px-4 py-3 text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A2F2EF] mr-2"></div>
                  Loading role...
                </div>
              )}
            </div>

            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-gray-100">
              {!isConnected ? (
                <button
                  onClick={onConnectWallet}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Mobile Principal Display */}
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{formatPrincipal(principal)}</span>
                      
                      {/* FIXED: Mobile role badge */}
                      {userRole && !roleLoading && (
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                          userRole === 'doctor' 
                            ? 'bg-blue-200 text-blue-900' 
                            : userRole === 'hospital'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {userRole}
                        </span>
                      )}
                      
                      {roleLoading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-600"></div>
                      )}
                    </div>
                    <button
                      onClick={onDisconnectWallet}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;