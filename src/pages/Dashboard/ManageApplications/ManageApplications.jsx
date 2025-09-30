import React, { useState, useEffect, useCallback } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [agents, setAgents] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [loading, setLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    // Fetch applications + agents together
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [appsRes, agentsRes] = await Promise.all([
                axiosSecure.get('/applications'),
                axiosSecure.get('/users/agents')
            ]);
            setApplications(appsRes.data);
            setAgents(agentsRes.data);
        } catch (error) {
            toast.error('Could not fetch data.', error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Handle status update (Approve/Reject)
    const handleStatusUpdate = (id, newStatus) => {
        axiosSecure.patch(`/applications/${id}`, { status: newStatus })
            .then(res => {
                if (res.data) {
                    toast.success(`Application has been ${newStatus.toLowerCase()}.`);
                    fetchAllData();
                }
            })
            .catch(() => toast.error('Status update failed.'));
    };

    // Handle assign agent
    const handleAssignAgent = (e) => {
        e.preventDefault();
        const selectedAgent = agents.find(agent => agent._id === selectedAgentId);
        if (!selectedAgent || !selectedApp) return;

        axiosSecure.patch(`/applications/${selectedApp._id}`, {
            agentId: selectedAgent._id,
            agentName: selectedAgent.name
        }).then(() => {
            toast.success(`Assigned to ${selectedAgent.name}`);
            fetchAllData();
            document.getElementById('assign_modal').close();
        }).catch(() => toast.error('Assignment failed.'));
    };

    const openAssignModal = (app) => {
        setSelectedApp(app);
        setSelectedAgentId('');
        document.getElementById('assign_modal').showModal();
    };

    if (loading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Manage Applications</title></Helmet>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Applications ({applications.length})</h1>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Applicant Name</th>
                            <th>Email</th>
                            <th>Policy</th>
                            <th>Status</th>
                            <th>Assigned Agent</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app, index) => (
                            <tr key={app._id}>
                                <th>{index + 1}</th>
                                <td>{app.applicantName}</td>
                                <td>{app.applicantEmail}</td>
                                <td>{app.policyTitle}</td>
                                <td>
                                    <span className={`badge ${
                                        app.status === 'Approved' ? 'badge-success' :
                                        app.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                                    }`}>{app.status}</span>
                                </td>
                                <td>{app.agentName || 'Not Assigned'}</td>
                                <td className='space-x-2'>
                                    <button 
                                        onClick={() => handleStatusUpdate(app._id, 'Approved')} 
                                        className="btn btn-sm btn-success"
                                        disabled={app.status !== 'Pending'}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(app._id, 'Rejected')} 
                                        className="btn btn-sm btn-error"
                                        disabled={app.status !== 'Pending'}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => openAssignModal(app)} 
                                        className="btn btn-sm btn-info"
                                        disabled={app.status !== 'Pending'}
                                    >
                                        Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assign Agent Modal */}
            <dialog id="assign_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Assign Agent for {selectedApp?.applicantName}</h3>
                    <form onSubmit={handleAssignAgent}>
                        <div className="form-control w-full my-6">
                            <select 
                                value={selectedAgentId} 
                                onChange={(e) => setSelectedAgentId(e.target.value)} 
                                className="select select-bordered" 
                                required
                            >
                                <option value="" disabled>Select an agent</option>
                                {agents.map(agent => (
                                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Confirm Assignment</button>
                    </form>
                    <div className="modal-action">
                        <button 
                            onClick={() => document.getElementById('assign_modal').close()} 
                            className="btn"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ManageApplications;
