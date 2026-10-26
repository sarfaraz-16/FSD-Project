import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navigationMenu } from '../../routes/navigation';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const redirectPath = logout();
    navigate(redirectPath || '/login');
  };

  if (!user) return null;

  return (
    <aside className={`bg-white h-screen border-r border-slate-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-[260px]'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary">SmartERP</span>
            <span className="text-xs text-slate-500">Business Management</span>
          </div>
        )}
        {isCollapsed && <span className="font-bold text-lg text-primary mx-auto">S</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navigationMenu.map((group, idx) => {
          const items = group.items.filter(item => item.roles.includes(user.role));
          if (items.length === 0) return null;

          return (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx} className="px-2">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-slate-600 hover:bg-primary-light hover:text-primary'
                        }`
                      }
                    >
                      <item.icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                      {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-1" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-slate-400 hover:text-red-500" title="Sign out">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
