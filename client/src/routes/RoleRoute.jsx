import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (user && roles.includes(user.role)) {
    return children ? children : <Outlet />;
  }

  return <Navigate to="/403" replace />;
};

export default RoleRoute;
