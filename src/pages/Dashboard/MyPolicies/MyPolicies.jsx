import React, { useState, useEffect, useContext } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const MyPolicies = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (user?.email) {
            setLoading(true);
            axiosSecure.get(`/applications/customer/${user.email}`)
                .then(res => {
                    setApplications(res.data);
                })
                .catch(error => {
                    toast.error('Could not fetch your policies.');
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user, axiosSecure]);

    if (loading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | My Policies</title></Helmet>
            <h1 className="text-3xl font-bold mb-6">My Submitted Applications ({applications.length})</h1>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Policy Title</th>
                            <th>Coverage</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app, index) => (
                            <tr key={app._id}>
                                <th>{index + 1}</th>
                                <td>{app.policyTitle}</td>
                                <td>{app.coverageAmount}</td>
                                <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${
                                        app.status === 'Approved' ? 'badge-success' :
                                        app.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                                    }`}>{app.status}</span>
                                </td>
                                <td>
                                    {app.status === 'Approved' && (
                                        <Link to={`/dashboard/payment/${app._id}`} className="btn btn-sm btn-primary">
                                            Pay Premium
                                        </Link>
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

export default MyPolicies;