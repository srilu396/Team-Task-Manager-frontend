import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes stale time
      gcTime: 1000 * 60 * 15,         // 15 minutes cache retention
      retry: 1,                       // 1 retry on failure
      refetchOnWindowFocus: false,     // Avoid aggressive refetching on tab switch
      refetchOnReconnect: false,       // Avoid refetching on reconnect if cache exists
      refetchOnMount: false,           // Avoid refetching on component remount if data is fresh
    },
  },
});

export default queryClient;
