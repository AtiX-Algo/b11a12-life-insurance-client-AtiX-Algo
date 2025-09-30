import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';

const MyPolicies = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    // Fetch applications with React Query
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
        onError: () => toast.error('Could not fetch your policies.')
    });

    // Handle PDF Download
    const handleDownloadPDF = (appId) => {
        const toastId = toast.loading('Generating PDF...');
        axiosSecure.get(`/applications/pdf/${appId}`, { responseType: 'blob' })
            .then(response => {
                // Create a URL for the blob
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Aegis-Life-Policy-${appId}.pdf`);
                
                // Append to html link element page
                document.body.appendChild(link);
                
                // Start download
                link.click();
                
                // Clean up and remove the link
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('PDF downloaded successfully!', { id: toastId });
            })
            .catch(() => toast.error('Failed to download PDF.', { id: toastId }));
    };

    // Show loading state
    if (isLoading || authLoading) {
        return (
            <div className="text-center my-10">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    // Show error state
    if (isError) {
        return (
            <div className="text-center my-10 text-red-500">
                Failed to load policies. Please try again later.
            </div>
        );
    }

    return (
        <div>
            <Helmet>
                <title>Dashboard | My Policies</title>
            </Helmet>
            
            <h1 className="text-3xl font-bold mb-6">My Submitted Applications ({applications.length})</h1>

            {applications.length === 0 ? (
                <div className="text-center my-20">
                    <p className="text-lg text-gray-600 mb-4">You haven't submitted any policy applications yet.</p>
                    <Link to="/policies" className="btn btn-primary">
                        Browse Policies
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="font-semibold">#</th>
                                <th className="font-semibold">Policy Title</th>
                                <th className="font-semibold">Coverage</th>
                                <th className="font-semibold">Submission Date</th>
                                <th className="font-semibold">Status</th>
                                <th className="font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, index) => (
                                <tr key={app._id} className="hover:bg-gray-50">
                                    <th>{index + 1}</th>
                                    <td className="font-medium">{app.policyTitle}</td>
                                    <td>${app.coverageAmount?.toLocaleString()}</td>
                                    <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                app.status === 'Approved'
                                                    ? 'badge-success text-white'
                                                    : app.status === 'Rejected'
                                                    ? 'badge-error text-white'
                                                    : 'badge-warning text-white'
                                            } font-medium`}
                                        >
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {app.status === 'Approved' && (
                                                <>
                                                    <Link
                                                        to={`/dashboard/payment/${app._id}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        Pay Premium
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDownloadPDF(app._id)} 
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        Download PDF
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'Rejected' && app.rejectionFeedback && (
                                                <div className="tooltip" data-tip={app.rejectionFeedback}>
                                                    <button className="btn btn-sm btn-outline btn-error">
                                                        View Feedback
                                                    </button>
                                                </div>
                                            )}
                                            {(app.status === 'Pending' || app.status === 'Under Review') && (
                                                <span className="text-gray-500 text-sm">Waiting for review</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyPolicies;