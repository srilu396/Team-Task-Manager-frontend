import React from 'react';

const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 ${rounded} ${className}`}></div>
  );
};

export default Skeleton;
