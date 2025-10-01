import React, { useState, useMemo } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FaCheck, FaTimes, FaUserPlus, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const ApplicationListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-base-100 rounded-lg shadow items-center">
                <div className="md:col-span-2 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-4 w-2/3"></div>
                <div className="skeleton h-6 w-24 rounded-full"></div>
                <div className="skeleton h-10 w-28 rounded-lg ml-auto"></div>
            </div>
        ))}
    </div>
);


const ManageApplications = () => {
    const [selectedApp, setSelectedApp] = useState(null);
    const [filter, setFilter] = useState('All');
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch applications
    const { data: applications = [], isLoading: loadingApps, isError: appsError } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/applications');
            return res.data;
        },
    });

    // Fetch agents
    const { data: agents = [] } = useQuery({
        queryKey: ['agents-list'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users/agents');
            return res.data;
        },
    });

    // Filtered applications based on the current filter state
    const filteredApplications = useMemo(() => {
        if (filter === 'All') return applications;
        return applications.filter(app => app.status === filter);
    }, [applications, filter]);


    // Mutation for all application updates (status, agent assignment, etc.)
    const applicationUpdateMutation = useMutation({
        mutationFn: ({ id, updateData }) => axiosSecure.patch(`/applications/${id}`, updateData),
        onSuccess: (data, variables) => {
            if (variables.updateData.rejectionFeedback) {
                toast.success('Application rejected with feedback.');
            } else if (variables.updateData.agentName) {
                toast.success(`Assigned to ${variables.updateData.agentName}.`);
            } else {
                toast.success(`Application has been ${variables.updateData.status}.`);
            }
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed.'),
    });

    // Handle approve/reject actions
    const handleStatusChange = (id, status, feedback = '') => {
        const updateData = { status };
        if (status === 'Rejected') {
            updateData.rejectionFeedback = feedback;
        }
        applicationUpdateMutation.mutate({ id, updateData });
    };

    // Handle reject with feedback
    const handleRejectSubmit = (data) => {
        if (!selectedApp) return;
        handleStatusChange(selectedApp._id, 'Rejected', data.feedback);
        document.getElementById('rejection_modal').close();
        reset();
    };

    // Handle assign agent form submit
    const handleAssignAgent = (e) => {
        e.preventDefault();
        const agentId = e.target.agent.value;
        const selectedAgent = agents.find((agent) => agent._id === agentId);
        if (!selectedAgent || !selectedApp) return;

        applicationUpdateMutation.mutate({
            id: selectedApp._id,
            updateData: { agentId: selectedAgent._id, agentName: selectedAgent.name },
        });
        document.getElementById('assign_modal').close();
    };

    const openAssignModal = (app) => {
        setSelectedApp(app);
        document.getElementById('assign_modal').showModal();
    };

    const openRejectionModal = (app) => {
        setSelectedApp(app);
        reset();
        document.getElementById('rejection_modal').showModal();
    };

    const statusStyles = {
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-error',
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Manage Applications</title></Helmet>
            <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Applications</h1>
                        <p className="text-base-content/70">Showing {filteredApplications.length} of {applications.length} total applications.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFilter />
                        <select className="select select-bordered select-sm" value={filter} onChange={e => setFilter(e.target.value)}>
                            <option>All</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                    {loadingApps ? (
                        <ApplicationListSkeleton />
                    ) : appsError ? (
                         <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Applications</h3>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl font-semibold">No Applications Found</h3>
                            <p className="text-base-content/70 mt-2">There are no applications matching the "{filter}" filter.</p>
                        </div>
                    ) : (
                        filteredApplications.map((app) => (
                            <div key={app._id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                <div className="md:col-span-2">
                                    <p className="font-bold">{app.applicantName}</p>
                                    <p className="text-sm text-base-content/60">{app.applicantEmail}</p>
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold">{app.policyTitle}</p>
                                    <p className="text-xs text-base-content/60">Submitted: {new Date(app.submissionDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{app.agentName || 'Unassigned'}</p>
                                    <span className={`badge ${statusStyles[app.status]}`}>{app.status}</span>
                                </div>
                                <div className="flex justify-end items-center gap-2">
                                    <div className="dropdown dropdown-left">
                                        <label tabIndex={0} className="btn btn-sm btn-outline">Actions</label>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                                            <li><button onClick={() => handleStatusChange(app._id, 'Approved')} disabled={app.status !== 'Pending'}><FaCheck /> Approve</button></li>
                                            <li><button onClick={() => openRejectionModal(app)} disabled={app.status !== 'Pending'}><FaTimes /> Reject</button></li>
                                            <div className="divider my-1"></div>
                                            <li><button onClick={() => openAssignModal(app)} disabled={app.status !== 'Pending'}><FaUserPlus /> Assign Agent</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <dialog id="assign_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Assign Agent to {selectedApp?.applicantName}</h3>
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <form onSubmit={handleAssignAgent} className="space-y-4 mt-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Select an Agent</span></label>
                            <select name="agent" className="select select-bordered" required defaultValue="">
                                <option value="" disabled>Choose an agent</option>
                                {agents.map((agent) => (<option key={agent._id} value={agent._id}>{agent.name}</option>))}
                            </select>
                        </div>
                        <div className="modal-action"><button type="submit" className="btn btn-primary w-full" disabled={applicationUpdateMutation.isPending}>
                            {applicationUpdateMutation.isPending && <span className="loading loading-spinner"></span>}
                            Confirm
                        </button></div>
                    </form>
                </div>
            </dialog>

            <dialog id="rejection_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Reason for Rejection</h3>
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <form onSubmit={handleSubmit(handleRejectSubmit)} className="space-y-4 mt-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Provide feedback for {selectedApp?.applicantName}</span></label>
                            <textarea {...register("feedback", { required: "Feedback is required" })} className={`textarea textarea-bordered h-24 ${errors.feedback ? 'textarea-error' : ''}`} placeholder="e.g., Missing documentation..."></textarea>
                             {errors.feedback && <span className="text-error text-sm mt-1">{errors.feedback.message}</span>}
                        </div>
                        <div className="modal-action"><button type="submit" className="btn btn-error w-full" disabled={applicationUpdateMutation.isPending}>
                             {applicationUpdateMutation.isPending && <span className="loading loading-spinner"></span>}
                            Confirm Rejection
                        </button></div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ManageApplications;