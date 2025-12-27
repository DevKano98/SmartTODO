import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default Loading;
