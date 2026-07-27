import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskService from '../services/task.service';

export const useTasksQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData) => taskService.createTask(taskData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      if (data?.project?._id || data?.project) {
        const projId = data.project._id || data.project;
        queryClient.invalidateQueries({ queryKey: ['projects', projId] });
      }
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, taskData }) => taskService.updateTask(id, taskData),
    onMutate: async ({ id, taskData }) => {
      // Cancel queries so optimistic update isn't overwritten
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasksQueries = queryClient.getQueriesData({ queryKey: ['tasks'] });

      // Optimistically update matching task items in cache
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((task) => (task._id === id ? { ...task, ...taskData } : task));
      });

      return { previousTasksQueries };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data?.project?._id || data?.project) {
        const projId = data.project._id || data.project;
        queryClient.invalidateQueries({ queryKey: ['projects', projId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }) => taskService.addComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

