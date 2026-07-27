import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/user.service';

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
    staleTime: 1000 * 60 * 3, // 3 mins
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};
