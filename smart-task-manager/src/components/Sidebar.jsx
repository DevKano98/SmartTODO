import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const navigation = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Pomodoro', 
      path: '/pomodoro', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Habits', 
      path: '/habits', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];
  
  const userNavigation = [
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                isActive 
                  ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <div className="mr-4 flex-shrink-0 text-gray-500 dark:text-gray-400">
                {item.icon}
              </div>
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-10 px-2">
          <div className="space-y-1">
            {userNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <div className="mr-4 flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {item.icon}
                </div>
                {item.name}
              </NavLink>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <div className="mr-4 flex-shrink-0 text-gray-500 dark:text-gray-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
              <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <div className="mr-3 flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </div>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              
              <div className="px-2 py-4 space-y-1 border-t border-gray-200 dark:border-gray-700">
                {userNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <div className="mr-3 flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </div>
                    {item.name}
                  </NavLink>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <div className="mr-3 flex-shrink-0 text-gray-500 dark:text-gray-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
