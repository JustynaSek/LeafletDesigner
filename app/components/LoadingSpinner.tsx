import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[200px] gap-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100"></div>
      {message && <p className="text-gray-900 dark:text-gray-100 text-lg">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 