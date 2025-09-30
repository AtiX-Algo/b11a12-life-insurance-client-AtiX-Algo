import React, { useState, useEffect, useContext, useCallback } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const AssignedCustomers = () => {
    const [applications, setApplications] = useState([]);
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const fetchAssigned = useCallback(() => {
        if (user?.email) {
            axiosSecure.get(`/applications/agent/${user.email}`)
                .then(res => setApplications(res.data));
        }
    }, [axiosSecure, user?.email]);

    useEffect(() => {
        fetchAssigned();
    }, [fetchAssigned]);
    
    const handleStatusUpdate = (id, newStatus) => {
        axiosSecure.patch(`/applications/${id}`, { status: newStatus })
            .then(() => {
                toast.success(`Application marked as ${newStatus}`);
                fetchAssigned();
            });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">My Assigned Customers</h1>
            <div className="overflow-x-auto mt-6">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Applicant Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id}>
                                <td>{app.applicantName}</td>
                                <td>{app.status}</td>
                                <td className="space-x-2">
                                    <button onClick={() => handleStatusUpdate(app._id, 'Approved')} className="btn btn-sm btn-success" disabled={app.status !== 'Pending'}>Approve</button>
                                    <button onClick={() => handleStatusUpdate(app._id, 'Rejected')} className="btn btn-sm btn-error" disabled={app.status !== 'Pending'}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignedCustomers;