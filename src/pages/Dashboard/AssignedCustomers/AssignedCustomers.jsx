import React, { useContext, useState, useMemo } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import { FaCheck, FaTimes, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const CustomerListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-100 rounded-lg shadow items-center">
                <div className="md:col-span-2 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-6 w-24 rounded-full"></div>
                <div className="skeleton h-10 w-28 rounded-lg ml-auto"></div>
            </div>
        ))}
    </div>
);


const AssignedCustomers = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('All');

    // Fetch assigned applications for the logged-in agent
    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ['assigned-applications', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/agent/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });
    
    // Filtered applications based on the current filter state
    const filteredApplications = useMemo(() => {
        if (filter === 'All') return applications;
        return applications.filter(app => app.status === filter);
    }, [applications, filter]);


    // Mutation for status updates
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, newStatus }) =>
            axiosSecure.patch(`/applications/${id}`, { status: newStatus }),
        onSuccess: (_, { newStatus }) => {
            toast.success(`Application marked as ${newStatus}`);
            queryClient.invalidateQueries({ queryKey: ['assigned-applications', user?.email] });
        },
        onError: () => toast.error('Status update failed.'),
    });

    const handleStatusUpdate = (id, newStatus) => {
        if (newStatus === 'Rejected') {
            Swal.fire({
                title: 'Are you sure?',
                text: "You are about to reject this application. This action is final.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Yes, reject it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateStatusMutation.mutate({ id, newStatus });
                }
            });
        } else {
             updateStatusMutation.mutate({ id, newStatus });
        }
    };

    const statusStyles = {
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-error',
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Assigned Customers</title></Helmet>
            <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Assigned Customers</h1>
                        <p className="text-base-content/70">You have {applications.length} total assigned applications.</p>
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
                    {isLoading ? (
                        <CustomerListSkeleton />
                    ) : isError ? (
                         <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Applications</h3>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl font-semibold">No Applications Found</h3>
                            <p className="text-base-content/70 mt-2">
                                {filter === 'All' 
                                    ? "You do not have any assigned applications at this time." 
                                    : `There are no applications matching the "${filter}" filter.`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredApplications.map((app) => (
                             <div key={app._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                <div className="md:col-span-2">
                                    <p className="font-bold">{app.applicantName}</p>
                                    <p className="text-sm text-base-content/60">{app.applicantEmail}</p>
                                     <p className="text-sm text-base-content/80 mt-1 font-semibold">{app.policyTitle}</p>
                                </div>
                                <div>
                                    <span className={`badge ${statusStyles[app.status]}`}>{app.status}</span>
                                </div>
                                <div className="flex justify-end items-center gap-2">
                                    <div className="dropdown dropdown-left">
                                        <label tabIndex={0} className="btn btn-sm btn-outline">Actions</label>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                                            <li><button onClick={() => handleStatusUpdate(app._id, 'Approved')} disabled={app.status !== 'Pending'}><FaCheck /> Approve</button></li>
                                            <li><button onClick={() => handleStatusUpdate(app._id, 'Rejected')} disabled={app.status !== 'Pending'}><FaTimes /> Reject</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignedCustomers;