import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div className="flex">
            {/* Dashboard Sidebar */}
            <div className="w-64 min-h-screen bg-base-200">
                <ul className="menu p-4">
                    <li><NavLink to="/dashboard/admin-home">Admin Home</NavLink></li>
                    <li><NavLink to="/dashboard/manage-users">Manage Users</NavLink></li>
                    <li><NavLink to="/dashboard/manage-applications">Manage Applications</NavLink></li>
                    <li><NavLink to="/dashboard/manage-policies">Manage Policies</NavLink></li>
                    <li><NavLink to="/dashboard/manage-blogs">Manage Blogs</NavLink></li>
                    <div className="divider"></div>
                    <li><NavLink to="/">Back to Home</NavLink></li>
                </ul>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;