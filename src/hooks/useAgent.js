import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthProvider';
import useAxiosSecure from '../api/axiosSecure';

const useAgent = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [isAgent, setIsAgent] = useState(false);
    const [isAgentLoading, setIsAgentLoading] = useState(true);

    useEffect(() => {
        if (!loading && user?.email) {
            axiosSecure.get(`/users/agent/${user.email}`)
                .then(res => {
                    setIsAgent(res.data.agent);
                    setIsAgentLoading(false);
                });
        } else if (!loading) {
            setIsAgentLoading(false);
        }
    }, [user, loading, axiosSecure]);

    return { isAgent, isAgentLoading };
};

export default useAgent;