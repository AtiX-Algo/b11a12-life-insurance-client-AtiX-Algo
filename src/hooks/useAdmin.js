import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';

const useAdmin = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const {
    data,
    isLoading: isAdminLoading,
    isError,
  } = useQuery({
    queryKey: ['isAdmin', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/admin/${user.email}`);
      return res.data.admin;
    },
    enabled: !loading && !!user?.email, // only run if user is available
  });

  return { 
    isAdmin: data ?? false, 
    isAdminLoading, 
    isError 
  };
};

export default useAdmin;
