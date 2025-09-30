import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const AllPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState(''); // State for category filter

    const categories = ["Term Life", "Senior Plan", "Health Insurance", "Family Plan"]; // Example categories

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/policies`, {
                    params: {
                        page: currentPage,
                        limit: 9,
                        category: category
                    }
                });
                setPolicies(response.data.policies);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("Error fetching policies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, [currentPage, category]); // Re-fetch when page or category changes

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCategoryFilter = (selectedCategory) => {
        setCategory(selectedCategory);
        setCurrentPage(1); // Reset to first page when category changes
    };

    if (loading) {
        return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    return (
        <>
            <Helmet><title>Aegis Life | All Policies</title></Helmet>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8">Our Insurance Policies</h1>
                
                {/* Category Filters */}
                <div className="flex justify-center gap-2 mb-8">
                    <button onClick={() => handleCategoryFilter('')} className={`btn ${category === '' ? 'btn-primary' : 'btn-ghost'}`}>All</button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => handleCategoryFilter(cat)} className={`btn ${category === cat ? 'btn-primary' : 'btn-ghost'}`}>{cat}</button>
                    ))}
                </div>

                {/* Policies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map(policy => (
                        <div key={policy._id} className="card bg-base-100 shadow-xl">
                            <figure><img src={policy.image} alt={policy.title} className="h-56 w-full object-cover" /></figure>
                            <div className="card-body">
                                <div className="badge badge-secondary">{policy.category}</div>
                                <h2 className="card-title">{policy.title}</h2>
                                <p>{policy.details.substring(0, 100)}...</p>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-primary">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-12">
                    <div className="join">
                        {[...Array(totalPages).keys()].map(num => (
                            <button
                                key={num + 1}
                                onClick={() => handlePageChange(num + 1)}
                                className={`join-item btn ${currentPage === num + 1 ? 'btn-active' : ''}`}
                            >
                                {num + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AllPolicies;