import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useThemeStore from '../store/themeStore';

const Layout = ({ children }) => {
  const location = useLocation();
  const { darkMode } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
