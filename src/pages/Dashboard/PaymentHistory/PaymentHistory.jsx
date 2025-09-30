import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const PaymentHistory = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['paymentHistory', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email, // Only run the query if the user's email is available
    });

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Payment History</title></Helmet>
            <h1 className="text-3xl font-bold mb-6">My Payment History ({payments.length})</h1>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                            <tr key={payment._id}>
                                <th>{index + 1}</th>
                                <td>{payment.transactionId}</td>
                                <td>${payment.price.toFixed(2)}</td>
                                <td>{new Date(payment.date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;