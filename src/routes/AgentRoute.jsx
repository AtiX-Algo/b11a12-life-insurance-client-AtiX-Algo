import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useAgent from '../hooks/useAgent';

const AgentRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const { isAgent, isAgentLoading } = useAgent();
    const location = useLocation();

    if (loading || isAgentLoading) {
        return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (user && isAgent) {
        return children;
    }

    return <Navigate to="/" state={{ from: location }} replace></Navigate>;
};

export default AgentRoute;