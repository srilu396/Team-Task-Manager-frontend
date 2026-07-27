import api from './api';

const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  updateRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  deleteAccount: async (password) => {
    const response = await api.delete('/users/delete-account', { data: { password } });
    return response.data;
  }
};

export default userService;
