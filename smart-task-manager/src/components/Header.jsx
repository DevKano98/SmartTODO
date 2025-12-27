import { useAuth } from '../context/AuthContext';
import useThemeStore from '../store/themeStore';
import { Link } from 'react-router-dom';

const Header = () => {
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeStore();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Toggle dark mode"
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
            
            <div className="ml-4 relative flex-shrink-0">
              <Link to="/profile" className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                  {currentUser?.displayName || 'User'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
