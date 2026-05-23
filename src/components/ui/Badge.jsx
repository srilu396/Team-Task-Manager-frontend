import React from 'react';

const Badge = ({ children, color = 'gray', className = '' }) => {
  // Status & Priority colors as requested
  const colors = {
    todo: 'bg-gray-100 text-gray-500', // #F3F4F6 text #6B7280
    in_progress: 'bg-blue-100 text-blue-700', // #DBEAFE text #1D4ED8
    review: 'bg-amber-100 text-amber-600', // #FEF3C7 text #D97706
    done: 'bg-green-100 text-green-800', // #D1FAE5 text #065F46
    low: 'bg-green-100 text-green-800', // #D1FAE5 text #065F46
    medium: 'bg-amber-100 text-amber-600', // #FEF3C7 text #D97706
    high: 'bg-red-100 text-red-600', // #FEE2E2 text #DC2626
    // Fallbacks
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const getMappedColor = () => {
    const val = color?.toLowerCase()?.replace(' ', '_');
    return colors[val] || colors.gray;
  };

  const isHex = color && color.startsWith('#');
  const customStyle = isHex ? {
    backgroundColor: `${color}1A`,
    color: color
  } : {};

  return (
    <span 
      className={`inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-medium leading-none ${isHex ? '' : getMappedColor()} ${className}`}
      style={customStyle}
    >
      {children}
    </span>
  );
};

export default Badge;
