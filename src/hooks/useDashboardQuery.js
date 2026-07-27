import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboard.service';

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 1000 * 60 * 2, // 2 mins
    refetchInterval: 1000 * 60 * 3, // 3 mins auto refetch
  });
};

export default useDashboardQuery;
