import React, { useState, useMemo } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

// Skeleton component for a better loading experience
const TransactionTableSkeleton = () => (
    <div className="overflow-x-auto">
        <table className="table">
            <thead>
                <tr>
                    <th><div className="skeleton h-4 w-8"></div></th>
                    <th><div className="skeleton h-4 w-32"></div></th>
                    <th><div className="skeleton h-4 w-40"></div></th>
                    <th><div className="skeleton h-4 w-20"></div></th>
                    <th><div className="skeleton h-4 w-28"></div></th>
                </tr>
            </thead>
            <tbody>
                {[...Array(10)].map((_, i) => (
                    <tr key={i}>
                        <td><div className="skeleton h-4 w-full"></div></td>
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


const ManageTransactions = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const { data: payments = [], isLoading, isError } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const res = await axiosSecure.get('/payments');
            return res.data;
        }
    });

    // Memoized sorting and filtering logic
    const filteredAndSortedPayments = useMemo(() => {
        let filtered = [...payments];
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [payments, searchTerm, sortConfig]);

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
            <Helmet><title>Dashboard | Manage Transactions</title></Helmet>
            <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Transactions</h1>
                        <p className="text-base-content/70">A total of {payments.length} transactions recorded.</p>
                    </div>
                    <div className="form-control">
                        <div className="join">
                            <input
                                type="text"
                                placeholder="Search by email or ID..."
                                className="input input-bordered join-item"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn join-item"><FaSearch /></button>
                        </div>
                    </div>
                </div>

                {isLoading ? <TransactionTableSkeleton /> : isError ? (
                    <div className="text-center py-16">
                        <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold">Failed to Load Transactions</h3>
                    </div>
                ) : filteredAndSortedPayments.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold">No Transactions Found</h3>
                        <p className="text-base-content/70 mt-2">
                            {searchTerm ? `No transactions match your search for "${searchTerm}".` : "There are no transactions recorded yet."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Customer Email</th>
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
                                {filteredAndSortedPayments.map((payment, index) => (
                                    <tr key={payment._id} className="hover">
                                        <th>{index + 1}</th>
                                        <td>{payment.email}</td>
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

export default ManageTransactions;