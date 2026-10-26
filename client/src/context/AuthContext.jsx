import React, { createContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (error) {
          console.error(error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const getRoleLandingPath = (role) => {
    switch (role) {
      case 'staff':
        return '/sales';
      case 'manager':
      case 'admin':
      default:
        return '/';
    }
  };

  const login = async (email, password, expectedRole) => {
    let res;
    try {
      res = await apiLogin(email, password, expectedRole);
    } catch (err) {
      if (err.response?.data?.errors?.some(e => typeof e === 'string' && e.includes('expectedRole'))) {
        res = await apiLogin(email, password);
      } else {
        throw err;
      }
    }
    const authenticatedUser = res.data.user;

    if (expectedRole && authenticatedUser.role !== expectedRole) {
      const roleCapitalized = expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1);
      throw new Error(`Access Denied: This account is not authorized to access the ${roleCapitalized} portal. Please use your designated portal.`);
    }

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    localStorage.setItem('lastPortal', authenticatedUser.role);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    const lastPortal = user?.role || localStorage.getItem('lastPortal');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return lastPortal ? `/login/${lastPortal}` : '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getRoleLandingPath }}>
      {children}
    </AuthContext.Provider>
  );
};
