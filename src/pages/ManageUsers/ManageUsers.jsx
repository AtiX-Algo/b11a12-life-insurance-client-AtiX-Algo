import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../../../src/api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FaUsers, FaUserShield, FaUserTie } from 'react-icons/fa';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('Could not fetch users.', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle role update
    const handleRoleUpdate = (user, newRole) => {
        axiosSecure.patch(`/users/admin/${user._id}`, { role: newRole })
            .then(res => {
                if (res.data) {
                    toast.success(`${user.name}'s role updated to ${newRole}.`);
                    fetchUsers(); // Refetch users to update the UI
                }
            })
            .catch(() => toast.error('Role update failed.'));
    };

    if (loading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Manage Users</title></Helmet>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Users ({users.length})</h1>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Current Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <th>{index + 1}</th>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td className='space-x-2'>
                                    {user.role === 'customer' && (
                                        <button 
                                            onClick={() => handleRoleUpdate(user, 'agent')} 
                                            className="btn btn-sm btn-outline btn-success tooltip"
                                            data-tip="Promote to Agent"
                                        >
                                            <FaUserTie />
                                        </button>
                                    )}
                                    {user.role === 'agent' && (
                                        <button 
                                            onClick={() => handleRoleUpdate(user, 'customer')}
                                            className="btn btn-sm btn-outline btn-warning tooltip"
                                            data-tip="Demote to Customer"
                                        >
                                            <FaUsers />
                                        </button>
                                    )}
                                    {user.role === 'admin' && (
                                        <span className="tooltip" data-tip="Admin role cannot be changed">
                                            <FaUserShield className="text-xl text-primary" />
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;