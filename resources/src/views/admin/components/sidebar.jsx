import React, { useState, useEffect } from 'react';
import {
  Squares2X2Icon,
  CalendarDateRangeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  CubeIcon,
  EnvelopeIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import Logo from '/logo.png';
import Logo1 from '/logo1.png';
import { NavLink } from 'react-router-dom';


const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, to: '/admin' },
    { id: 'doctors', label: 'Doctors', icon: UserCircleIcon, to: '/admin/doctors' },
  ];

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileOpen && !event.target.closest('.sidebar-container')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  // Mobile toggle button (always visible on mobile)
  const MobileToggle = () => (
    <div className={`md:hidden fixed bottom-4 left-4 z-50 transform transition-transform duration-300 ease-in-out ${
      isMobileOpen ? 'translate-x-72' : 'translate-x-0'
    }`}>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        aria-label="Toggle menu"
      >
        <div className={`w-6 h-6 transition-transform duration-300 ${isMobileOpen ? 'rotate-90' : 'rotate-0'}`}>
          {isMobileOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </div>
      </button>
    </div>
  );

  // Desktop collapse toggle
  const DesktopToggle = () => (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
      aria-label="Toggle sidebar"
    >
      {isCollapsed ? (
        <ChevronRightIcon className="w-3 h-3 text-gray-600" />
      ) : (
        <ChevronLeftIcon className="w-3 h-3 text-gray-600" />
      )}
    </button>
  );

  const sidebarClasses = `
    sidebar-container
    ${isMobile ? 'fixed' : 'sticky top-0 h-screen'}
    ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0 h-full'}
    ${isMobile ? 'w-72' : isCollapsed ? 'w-16' : 'w-56'}
    bg-gray-50 border-r border-gray-200 flex flex-col min-h-screen
    transition-all duration-300 ease-in-out
    ${isMobile ? 'z-40 shadow-xl' : 'z-40'}
  `;

  return (
    <>
      <MobileToggle />
      
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <DesktopToggle />
        
        {/* Logo */}
        <div className={`flex items-center px-3 py-6 ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <NavLink to="/" className="block">
            {isCollapsed && !isMobile ? (
              <div className="rounded-lg flex items-center justify-center">
                <img src={Logo1} alt="Logo1" className="w-30 h-full object-contain cursor-pointer hover:opacity-80 transition-opacity" />
              </div>
            ) : (
              <div className="flex items-center">
                <img src={Logo} alt="Logo" className="w-30 h-full object-contain cursor-pointer hover:opacity-80 transition-opacity" />
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center px-3 py-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 relative
                    ${isActive
                      ? 'bg-[#A2F2EF] text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
                  {(!isCollapsed || isMobile) && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </NavLink>
                
                {/* Desktop tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;