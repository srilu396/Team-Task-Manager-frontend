import React from 'react';

const Avatar = ({ name, src, size = 'md', className = '', style = {} }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getColor = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-green-500', 'bg-teal-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const hasImage = src && src !== 'null' && src !== 'undefined' && src !== '';
  
  let imgUrl = null;
  if (hasImage) {
    if (src.startsWith('http') || src.startsWith('data:')) {
      imgUrl = src;
    } else {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://team-task-manager-0wk0.onrender.com/api';
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');
      const cleanPath = src.startsWith('/') ? src : `/${src}`;
      imgUrl = `${baseUrl}${cleanPath}`;
    }
  }

  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-medium overflow-hidden shrink-0 ${!hasImage ? getColor(name) : 'bg-gray-100'} ${sizes[size] || sizes.md} ${className}`}
      style={style}
    >
      {hasImage ? (
        <img 
          src={imgUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            // Trigger a fallback by resetting display and showing initials if possible
            const parent = e.target.parentNode;
            if (parent) {
              parent.className = parent.className.replace('bg-gray-100', getColor(name));
              const initialsSpan = document.createElement('span');
              initialsSpan.innerText = getInitials(name);
              parent.appendChild(initialsSpan);
            }
          }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

export default Avatar;

