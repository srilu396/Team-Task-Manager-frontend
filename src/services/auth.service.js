import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (fullName, email, password, role, teamCode) => {
    const response = await api.post('/auth/signup', { fullName, email, password, role, teamCode });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPasswordDirect: async (email, password, confirmPassword) => {
    const response = await api.post('/auth/reset-password-direct', { email, password, confirmPassword });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};

export default authService;
