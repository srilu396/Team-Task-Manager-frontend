import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/project.service';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useProjectDetailQuery = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectData) => projectService.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectData }) => projectService.updateProject(id, projectData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useAddProjectMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, email }) => projectService.addMember(projectId, email),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAddProjectMembersBulkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userIds }) => projectService.addMembersBulk(projectId, userIds),
    onMutate: async ({ projectId, userIds }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['users'] });

      const previousProjects = queryClient.getQueryData(['projects']);
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update projects list in cache
      queryClient.setQueryData(['projects'], (oldProjects) => {
        if (!Array.isArray(oldProjects)) return oldProjects;
        return oldProjects.map((proj) => {
          if (proj._id === projectId) {
            const existingMemberUserIds = new Set(
              (proj.members || []).map((m) => (typeof m.user === 'object' ? m.user?._id : m.user))
            );
            const newMemberEntries = userIds
              .filter((id) => !existingMemberUserIds.has(id))
              .map((id) => {
                const userObj = Array.isArray(previousUsers) ? previousUsers.find((u) => u._id === id) : null;
                return { user: userObj || id, role: 'member' };
              });
            return {
              ...proj,
              members: [...(proj.members || []), ...newMemberEntries],
            };
          }
          return proj;
        });
      });

      // Optimistically update users list in cache (increment assigned count)
      queryClient.setQueryData(['users'], (oldUsers) => {
        if (!Array.isArray(oldUsers)) return oldUsers;
        return oldUsers.map((u) => {
          if (userIds.includes(u._id)) {
            return {
              ...u,
              assignedTasksCount: u.assignedTasksCount || 0,
            };
          }
          return u;
        });
      });

      return { previousProjects, previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};
