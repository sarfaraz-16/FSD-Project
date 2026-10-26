import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const HRLayout = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Human Resources</h1>
        <p className="text-slate-500">Manage employees and system users</p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <NavLink
            to="/hr"
            end
            className={() =>
              `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                location.pathname === '/hr'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`
            }
          >
            Employees
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/hr/users"
              className={({ isActive }) =>
                `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`
              }
            >
              Users & Roles
            </NavLink>
          )}
        </nav>
      </div>

      <Outlet />
    </div>
  );
};

export default HRLayout;
