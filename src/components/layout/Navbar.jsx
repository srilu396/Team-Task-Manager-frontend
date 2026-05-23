import React, { useContext, useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, LogOut, User, CheckSquare, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Avatar from '../ui/Avatar';
import ProfileModal from '../ui/ProfileModal';
import projectService from '../../services/project.service';
import taskService from '../../services/task.service';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const avatarRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) setIsAvatarMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[64px] px-4 sm:px-8 bg-white border-b border-gray-200 shadow-sm transition-all">
      <div className="flex items-center flex-1">
        <button 
          className="p-2 mr-4 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white border border-gray-200 rounded-[12px] shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-[14px] text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span 
                    onClick={() => {
                      notifications.filter(n => !n.read).forEach(n => markAsRead(n._id));
                    }}
                    className="text-[12px] text-blue-600 font-medium cursor-pointer hover:underline"
                  >
                    Mark all as read
                  </span>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[13px] text-gray-500 italic">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification._id} 
                      onClick={() => markAsRead(notification._id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          !notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-grow">
                          <p className={`text-[13px] text-gray-900 text-left whitespace-normal ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 text-left">
                            {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

        {/* User Avatar Menu */}
        <div className="relative" ref={avatarRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-[8px] transition-colors"
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
          >
            <Avatar 
              name={user?.fullName || 'User'} 
              src={user?.profileImage || user?.avatar} 
              size="sm" 
              className="border border-gray-200"
            />
            <span className="hidden sm:block text-[14px] font-medium text-gray-700">{user?.fullName || 'Admin User'}</span>
          </div>
          
          {isAvatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-[220px] bg-white border border-gray-200 rounded-[12px] shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-[14px] font-semibold text-gray-900">{user?.fullName || 'Admin User'}</p>
                <p className="text-[12px] text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setIsAvatarMenuOpen(false); setIsProfileModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-gray-400" /> My Profile
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
};

export default Navbar;
