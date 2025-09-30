import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';

const useAdmin = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);

    useEffect(() => {
        if (!loading && user?.email) {
            axiosSecure.get(`/users/admin/${user.email}`)
                .then(res => {
                    setIsAdmin(res.data.admin);
                    setIsAdminLoading(false);
                })
                .catch(() => {
                    setIsAdminLoading(false);
                });
        } else if (!loading) {
            setIsAdminLoading(false);
        }
    }, [user, loading, axiosSecure]);

    return { isAdmin, isAdminLoading };
};

export default useAdmin;