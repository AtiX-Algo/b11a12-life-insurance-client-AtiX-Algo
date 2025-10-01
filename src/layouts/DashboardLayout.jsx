import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import useAgent from '../hooks/useAgent';
import { FaHome, FaUsers, FaFileAlt, FaBook, FaHistory, FaTh, FaUserTie, FaClipboardList, FaBlog, FaDollarSign, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext'; 
import { useContext } from 'react';

const SidebarLink = ({ to, icon, label }) => (
    <li>
        <NavLink to={to} className={({ isActive }) => isActive ? 'bg-primary text-white' : ''}>
            {icon}
            {label}
        </NavLink>
    </li>
);

const DashboardLayout = () => {
    const { isAdmin, isAdminLoading } = useAdmin();
    const { isAgent, isAgentLoading } = useAgent();
    const { user, logOut } = useContext(AuthContext); // Get user for the header
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isAdminLoading || isAgentLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    const adminLinks = [
        { to: "/dashboard/admin-home", icon: <FaTh />, label: "Dashboard" },
        { to: "/dashboard/manage-users", icon: <FaUsers />, label: "Manage Users" },
        { to: "/dashboard/manage-applications", icon: <FaFileAlt />, label: "Applications" },
        { to: "/dashboard/manage-policies", icon: <FaBook />, label: "Manage Policies" },
        { to: "/dashboard/manage-blogs", icon: <FaBlog />, label: "Manage Blogs" },
        { to: "/dashboard/manage-transactions", icon: <FaDollarSign />, label: "Transactions" },
    ];

    const agentLinks = [
        { to: "/dashboard/agent-home", icon: <FaTh />, label: "Dashboard" },
        { to: "/dashboard/assigned-customers", icon: <FaUsers />, label: "My Customers" },
        { to: "/dashboard/policy-clearance", icon: <FaClipboardList />, label: "Policy Clearance" },
        { to: "/dashboard/manage-my-blogs", icon: <FaBlog />, label: "My Blogs" },
    ];

    const customerLinks = [
        { to: "/dashboard/my-policies", icon: <FaBook />, label: "My Policies" },
        { to: "/dashboard/request-claim", icon: <FaFileAlt />, label: "Request a Claim" },
        { to: "/dashboard/submit-review", icon: <FaUserTie />, label: "Submit a Review" },
        { to: "/dashboard/payment-history", icon: <FaHistory />, label: "Payment History" },
    ];
    
    let links = customerLinks;
    if (isAdmin) links = adminLinks;
    if (isAgent) links = agentLinks;

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" checked={isSidebarOpen} onChange={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            {/* Sidebar Content */}
            <aside className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="p-4 w-64 min-h-full bg-base-200 text-base-content">
                    <Link to="/" className="text-2xl font-bold p-4">Aegis Life</Link>
                    <ul className="menu mt-4">
                        {links.map(link => <SidebarLink key={link.to} {...link} />)}
                        <div className="divider"></div>
                        <SidebarLink to="/" icon={<FaHome />} label="Back to Home" />
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className="drawer-content flex flex-col">
                {/* Top Navigation Bar */}
                <header className="navbar bg-base-100 shadow-sm sticky top-0 z-20">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                            <FaBars />
                        </label>
                    </div>
                    <div className="flex-1">
                        {/* You can add a dynamic page title here if you want */}
                    </div>
                    <div className="flex-none">
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img alt="User Avatar" src={user?.photoURL || 'https://via.placeholder.com/96'} />
                                </div>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li className="menu-title"><span>{user?.displayName}</span></li>
                                <li><Link to="/dashboard/profile">Profile</Link></li>
                                <li><button onClick={logOut}>Logout</button></li>
                            </ul>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 bg-base-200">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;