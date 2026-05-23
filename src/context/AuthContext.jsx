import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe()
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ 
      id: data.user.id, 
      name: data.user.fullName, 
      email: data.user.email, 
      role: data.user.role,
      profileImage: data.user.profileImage,
      avatar: data.user.avatar,
      teamCode: data.user.teamCode
    }));
    setUser(data.user);
    return data;
  };

  const signup = async (fullName, email, password, role, teamCode) => {
    const data = await authService.signup(fullName, email, password, role, teamCode);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ 
      id: data.user.id, 
      name: data.user.fullName, 
      email: data.user.email, 
      role: data.user.role,
      profileImage: data.user.profileImage,
      avatar: data.user.avatar,
      teamCode: data.user.teamCode
    }));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify({
      id: updatedUser.id || updatedUser._id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      avatar: updatedUser.avatar,
      teamCode: updatedUser.teamCode
    }));
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isMember, login, signup, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
