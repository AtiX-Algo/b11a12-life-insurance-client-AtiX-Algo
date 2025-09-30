import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import useAgent from '../hooks/useAgent';

const DashboardLayout = () => {
    const { isAdmin, isAdminLoading } = useAdmin();
    const { isAgent, isAgentLoading } = useAgent();

    // Show loading spinner while role data is being fetched
    if (isAdminLoading || isAgentLoading) {
        return (
            <div className="text-center my-10">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-64 min-h-screen bg-base-200">
                <ul className="menu p-4">
                    {isAdmin ? (
                        <>
                            {/* Admin Links */}
                            <li><NavLink to="/dashboard/admin-home">Admin Home</NavLink></li>
                            <li><NavLink to="/dashboard/manage-users">Manage Users</NavLink></li>
                            <li><NavLink to="/dashboard/manage-applications">Manage Applications</NavLink></li>
                            <li><NavLink to="/dashboard/manage-policies">Manage Policies</NavLink></li>
                            <li><NavLink to="/dashboard/manage-blogs">Manage Blogs</NavLink></li>
                            <li><NavLink to="/dashboard/manage-transactions">Manage Transactions</NavLink></li> {/* <-- ADD THIS LINE */}
                            <li><NavLink to="/dashboard/manage-users">Manage Users</NavLink></li>
                        </>
                    ) : isAgent ? (
                        <>
                            {/* Agent Links */}
                            <li><NavLink to="/dashboard/agent-home">Agent Home</NavLink></li>
                            <li><NavLink to="/dashboard/assigned-customers">Assigned Customers</NavLink></li>
                            <li><NavLink to="/dashboard/policy-clearance">Policy Clearance</NavLink></li>
                            <li><NavLink to="/dashboard/manage-my-blogs">Manage My Blogs</NavLink></li>
                        </>
                    ) : (
                        <>
                            {/* Customer Links */}
                            <li><NavLink to="/dashboard/my-policies">My Policies</NavLink></li>
                            <li><NavLink to="/dashboard/request-claim">Request a Claim</NavLink></li>
                            <li><NavLink to="/dashboard/submit-review">Submit a Review</NavLink></li>
                            <li><NavLink to="/dashboard/payment-history">Payment History</NavLink></li>
                        </>
                    )}

                    {/* Common Links */}
                    <div className="divider"></div>
                    <li><NavLink to="/">Back to Home</NavLink></li>
                </ul>
            </div>

            {/* Main Dashboard Content */}
            <div className="flex-1 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
