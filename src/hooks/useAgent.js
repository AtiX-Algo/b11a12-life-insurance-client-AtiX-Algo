import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';

const useAgent = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const {
    data,
    isLoading: isAgentLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['isAgent', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/agent/${user.email}`);
      return res.data.agent;
    },
    enabled: !loading && !!user?.email, // only run if user is ready
  });

  return {
    isAgent: data ?? false,
    isAgentLoading,
    isError,
    error,
  };
};

export default useAgent;
