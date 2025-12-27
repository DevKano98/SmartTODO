const Logo = ({ className = '' }) => {
    return (
      <div className={`flex items-center ${className}`}>
        <svg 
          className="h-full w-auto" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 7L12 12L22 7L12 2Z" 
            fill="currentColor" 
            className="text-primary-600 dark:text-primary-400"
          />
          <path 
            d="M2 17L12 22L22 17" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary-600 dark:text-primary-400"
          />
          <path 
            d="M2 12L12 17L22 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary-600 dark:text-primary-400"
          />
        </svg>
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
      </div>
    );
  };
  
  export default Logo;
  