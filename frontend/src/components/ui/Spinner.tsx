import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-gold-500"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-navy-700 animate-spin"></div>
      </div>
    </div>
  );
};
