// src/components/PagePlaceholder.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const PagePlaceholder: React.FC = () => {
  const location = useLocation();
  // Derive a user-friendly name from the route path
  const pageName = location.pathname
    .split('/')
    .filter(Boolean) // Remove empty strings from split
    .pop() // Get the last part of the path
    ?.replace(/-/g, ' ') || 'Page';

  // Capitalize the first letter of each word for a cleaner title
  const formattedPageName = pageName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-gray-50 dark:bg-primary-dark rounded-lg shadow-md">
      <div className="text-5xl mb-4">🚧</div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
        Coming Soon
      </h1>
      <p className="text-md md:text-lg text-gray-600 dark:text-gray-400">
        The <span className="font-semibold text-accent">{formattedPageName}</span> page is under construction.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        This feature will be available shortly.
      </p>
    </div>
  );
};

export default PagePlaceholder;
