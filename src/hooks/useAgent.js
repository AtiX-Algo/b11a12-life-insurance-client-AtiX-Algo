import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';

const useAgent = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [isAgent, setIsAgent] = useState(false);
    const [isAgentLoading, setIsAgentLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAgentStatus = async () => {
            if (!loading && user?.email) {
                try {
                    const res = await axiosSecure.get(`/users/agent/${user.email}`);
                    if (isMounted) {
                        setIsAgent(res.data.agent);
                        setError(null);
                    }
                } catch (err) {
                    if (isMounted) {
                        console.error("Error fetching agent status:", err);
                        setError(err);
                        setIsAgent(false);
                    }
                } finally {
                    if (isMounted) {
                        setIsAgentLoading(false);
                    }
                }
            } else if (!loading) {
                setIsAgentLoading(false);
            }
        };

        fetchAgentStatus();

        return () => {
            isMounted = false;
        };
    }, [user, loading, axiosSecure]);

    return { isAgent, isAgentLoading, error };
};

export default useAgent;
