import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useThemeStore from '../store/themeStore';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-primary-500 text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              {darkMode ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative group"
                    title="Your Profile"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.photoURL ? (
                      <div className="relative">
                        <img
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                          src={user.photoURL}
                          alt={user.displayName || "User profile"}
                        />
                        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></span>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-800">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 -left-4 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      Update Profile
                      <div className="absolute top-full left-6 transform -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  </button>
                </div>
                
                {profileDropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="py-1" role="none">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-3 flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            <div className="ml-3 -mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive 
                      ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20' 
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-white'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <div className="relative">
                      <img
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                        src={user.photoURL}
                        alt={user.displayName || "User profile"}
                      />
                      <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></span>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-800">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user.displayName || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
