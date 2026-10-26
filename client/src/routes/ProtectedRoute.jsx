import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 flex justify-center items-center h-screen text-slate-500">Loading...</div>;

  if (!user) {
    const lastPortal = localStorage.getItem('lastPortal');
    const redirectPath = lastPortal && ['admin', 'manager', 'staff'].includes(lastPortal)
      ? `/login/${lastPortal}`
      : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
