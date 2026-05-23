import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, X, Copy, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.teamCode) {
      navigator.clipboard.writeText(user.teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let navItems = [];
  if (isAdmin) {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Projects', path: '/projects', icon: FolderKanban },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare },
      { name: 'Team Members', path: '/team', icon: Users },
    ];
  } else {
    navItems = [
      { name: 'My Dashboard', path: '/my-tasks', icon: LayoutDashboard },
      { name: 'My Projects', path: '/projects', icon: FolderKanban },
      { name: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F8FAFC] border-r border-gray-200 text-text-main transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 mb-6">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: '#1E1B4B',
              borderRadius: '12px',
              flex: 1,
              marginRight: '8px'
            }}>
              <img
                src="/logo.svg"
                alt="TaskNova"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px'
                }}
              />
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.5px'
              }}>
                Task<span style={{ color: '#A5B4FC' }}>Nova</span>
              </span>
            </div>
            <button className="lg:hidden p-1 text-gray-500 hover:text-gray-800" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      isActive 
                        ? 'bg-[#E0E7FF] text-primary' 
                        : 'text-text-muted hover:bg-gray-100 hover:text-text-main'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Area */}
          <div className="px-4 mt-auto pt-4 border-t border-gray-200 space-y-3">
             {user && (
               <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-gray-200/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-100">
                 <Avatar name={user.fullName} src={user.profileImage || user.avatar} size="md" className="border border-gray-200 shadow-sm" />
                 <div className="flex-1 min-w-0">
                   <p className="text-[14px] font-bold text-gray-900 truncate leading-snug">{user.fullName}</p>
                   <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                     {user.role}
                   </span>
                 </div>
               </div>
             )}

             {user && isAdmin && user.teamCode && (
               <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/85 flex items-center justify-between gap-2 shadow-sm">
                 <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Team Code</p>
                   <p className="text-[13px] font-extrabold text-indigo-900 tracking-wide font-mono mt-0.5">{user.teamCode}</p>
                 </div>
                 <button
                   onClick={handleCopyCode}
                   className="p-1.5 rounded-lg hover:bg-indigo-100/80 text-indigo-600 transition-colors shrink-0"
                   title="Copy team code"
                 >
                   {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                 </button>
               </div>
             )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


