import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { FaUsers, FaFileAlt, FaBook, FaDollarSign } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

// Skeletons for a better loading experience
const StatCardSkeleton = () => (
    <div className="card bg-base-100 shadow-md">
        <div className="card-body">
            <div className="skeleton h-8 w-8 rounded-full"></div>
            <div className="skeleton h-6 w-1/2 mt-2"></div>
            <div className="skeleton h-10 w-3/4 mt-1"></div>
        </div>
    </div>
);

const RecentActivitySkeleton = () => (
    <div className="card bg-base-100 shadow-md">
        <div className="card-body">
            <div className="skeleton h-8 w-1/3 mb-4"></div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="skeleton h-12 w-12 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-3/4"></div>
                            <div className="skeleton h-4 w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const AdminHome = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    // Query for the statistics cards
    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin-stats');
            return res.data;
        },
    });

    // Query for the recent applications table
    const { data: recentApps = [], isLoading: appsLoading, isError: appsError } = useQuery({
        queryKey: ['recent-applications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/applications/recent');
            return res.data;
        }
    });

    const isLoading = statsLoading || appsLoading;

    const statCards = [
        { title: "Total Users", value: stats?.totalUsers ?? 0, icon: <FaUsers />, color: "bg-blue-500" },
        { title: "Pending Applications", value: stats?.pendingApplications ?? 0, icon: <FaFileAlt />, color: "bg-yellow-500" },
        { title: "Total Policies", value: stats?.totalPolicies ?? 0, icon: <FaBook />, color: "bg-green-500" },
        { title: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <FaDollarSign />, color: "bg-indigo-500" }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName || 'Admin'}!</h1>
            <p className="text-base-content/70 mb-6">Here's a summary of your platform's activity.</p>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    statCards.map(card => (
                        <div key={card.title} className="card bg-base-100 shadow-md">
                            <div className="card-body flex-row items-center gap-4">
                                <div className={`p-3 rounded-full text-white ${card.color}`}>
                                    {React.cloneElement(card.icon, { className: "text-2xl" })}
                                </div>
                                <div>
                                    <h3 className="text-base-content/70">{card.title}</h3>
                                    <p className="text-3xl font-bold">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Recent Applications Table */}
            <div className="mt-8">
                {isLoading ? (
                    <RecentActivitySkeleton />
                ) : (
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="card-title">Recent Applications</h2>
                                <Link to="/dashboard/manage-applications" className="btn btn-sm btn-ghost">View All</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Policy</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApps.map(app => (
                                            <tr key={app._id} className="hover">
                                                <td>
                                                    <div className="font-bold">{app.applicantName}</div>
                                                    <div className="text-sm opacity-50">{app.applicantEmail}</div>
                                                </td>
                                                <td>{app.policyTitle}</td>
                                                <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                                                <td><span className={`badge ${app.status === 'Pending' ? 'badge-warning' : 'badge-ghost'}`}>{app.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
             {(statsError || appsError) && <div className="text-error mt-6">Failed to load dashboard data. Please ensure the backend server is running and the endpoints are correct.</div>}
        </div>
    );
};

export default AdminHome;