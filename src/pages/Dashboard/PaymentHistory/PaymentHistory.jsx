import React, { useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { FaSort, FaSortUp, FaSortDown, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const PaymentHistorySkeleton = () => (
    <div className="overflow-x-auto">
        <table className="table">
            <thead>
                <tr>
                    <th><div className="skeleton h-4 w-8"></div></th>
                    <th><div className="skeleton h-4 w-40"></div></th>
                    <th><div className="skeleton h-4 w-20"></div></th>
                    <th><div className="skeleton h-4 w-28"></div></th>
                </tr>
            </thead>
            <tbody>
                {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                        <td><div className="skeleton h-4 w-full"></div></td>
                        <td><div className="skeleton h-4 w-full"></div></td>
                        <td><div className="skeleton h-4 w-full"></div></td>
                        <td><div className="skeleton h-4 w-full"></div></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const PaymentHistory = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const { data: payments = [], isLoading, isError } = useQuery({
        queryKey: ['paymentHistory', user?.email],
        queryFn: async () => {
            // --- BUG FIX: Corrected the API endpoint ---
            const res = await axiosSecure.get(`/payments/user/${user.email}`);
            return res.data;
        },
        enabled: !authLoading && !!user?.email,
    });

    // Memoized sorting logic
    const sortedPayments = useMemo(() => {
        let sortableItems = [...payments];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [payments, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <FaSort className="inline-block ml-1 text-gray-400" />;
        }
        return sortConfig.direction === 'asc' ? <FaSortUp className="inline-block ml-1" /> : <FaSortDown className="inline-block ml-1" />;
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Payment History</title></Helmet>
            <div className="card-body">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">My Payment History</h1>
                    <p className="text-base-content/70">A record of all your successful premium payments.</p>
                </div>

                {isLoading || authLoading ? <PaymentHistorySkeleton /> : isError ? (
                    <div className="text-center py-16">
                        <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold">Failed to Load Payment History</h3>
                    </div>
                ) : sortedPayments.length === 0 ? (
                    <div className="text-center py-16 bg-base-200 rounded-lg">
                        <h3 className="text-2xl font-semibold">No Payments Found</h3>
                        <p className="text-base-content/70 mt-2">You have not made any payments yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Transaction ID</th>
                                    <th onClick={() => handleSort('price')} className="cursor-pointer">
                                        Amount {getSortIcon('price')}
                                    </th>
                                    <th onClick={() => handleSort('date')} className="cursor-pointer">
                                        Date {getSortIcon('date')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPayments.map((payment, index) => (
                                    <tr key={payment._id} className="hover">
                                        <th>{index + 1}</th>
                                        <td className="font-mono text-xs">{payment.transactionId}</td>
                                        <td>${payment.price.toFixed(2)}</td>
                                        <td>{new Date(payment.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;