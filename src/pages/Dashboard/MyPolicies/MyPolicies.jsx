import React, { useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { FaFilePdf, FaCreditCard, FaCommentDots, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const PolicyListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-100 rounded-lg shadow items-center">
                <div className="md:col-span-2 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-6 w-24 rounded-full"></div>
                <div className="skeleton h-10 w-full md:w-40 rounded-lg ml-auto"></div>
            </div>
        ))}
    </div>
);

const MyPolicies = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [filter, setFilter] = useState('All');

    const { 
        data: applications = [], 
        isLoading, 
        isError 
    } = useQuery({
        queryKey: ['myApplications', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/applications/customer/${user.email}`);
            return res.data;
        },
        enabled: !authLoading && !!user?.email,
    });

    // Filtered applications based on the current filter state
    const filteredApplications = useMemo(() => {
        if (filter === 'All') return applications;
        return applications.filter(app => app.status === filter);
    }, [applications, filter]);

    const handleDownloadPDF = (appId) => {
        const toastId = toast.loading('Generating your policy PDF...');
        axiosSecure.get(`/applications/pdf/${appId}`, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Aegis-Life-Policy-${appId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('PDF downloaded successfully!', { id: toastId });
            })
            .catch(() => toast.error('Failed to download PDF.', { id: toastId }));
    };
    
    const statusStyles = {
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-error',
    };
    
    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | My Policies</title></Helmet>
            <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <div>
                        <h1 className="text-2xl font-bold">My Policy Applications</h1>
                        <p className="text-base-content/70">You have submitted {applications.length} applications.</p>
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
                
                 <div className="space-y-4">
                    {isLoading || authLoading ? <PolicyListSkeleton /> : isError ? (
                         <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Policies</h3>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-16 bg-base-200 rounded-lg">
                            <h3 className="text-2xl font-semibold">No Applications Found</h3>
                            <p className="text-base-content/70 mt-2 mb-4">You haven't applied for any policies yet.</p>
                            <Link to="/policies" className="btn btn-primary">Browse Policies</Link>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                         <div className="text-center py-16 bg-base-200 rounded-lg">
                            <h3 className="text-2xl font-semibold">No Applications Found</h3>
                            <p className="text-base-content/70 mt-2">There are no applications matching the "{filter}" filter.</p>
                        </div>
                    ) : (
                        filteredApplications.map((app) => (
                             <div key={app._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                <div className="md:col-span-2">
                                    <p className="font-bold">{app.policyTitle}</p>
                                    <p className="text-sm text-base-content/60">Coverage: ${app.coverageAmount?.toLocaleString()} | Submitted: {new Date(app.submissionDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className={`badge ${statusStyles[app.status]}`}>{app.status}</span>
                                </div>
                                <div className="flex justify-end items-center gap-2 flex-wrap">
                                    {app.status === 'Approved' && (
                                        <>
                                            <Link to={`/dashboard/payment/${app._id}`} className="btn btn-sm btn-primary"><FaCreditCard /> Pay</Link>
                                            <button onClick={() => handleDownloadPDF(app._id)} className="btn btn-sm btn-secondary"><FaFilePdf /> PDF</button>
                                        </>
                                    )}
                                     {app.status === 'Rejected' && app.rejectionFeedback && (
                                        <div className="tooltip" data-tip={app.rejectionFeedback}>
                                            <button className="btn btn-sm btn-outline btn-error"><FaCommentDots /> Feedback</button>
                                        </div>
                                    )}
                                     {app.status === 'Pending' && <span className="text-sm text-base-content/60">Awaiting review...</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPolicies;