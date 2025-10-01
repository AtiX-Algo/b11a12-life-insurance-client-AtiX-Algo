import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaSadTear } from 'react-icons/fa';

// Skeleton Component for Loading State
const PolicyCardSkeleton = () => (
    <div className="card bg-base-100 shadow-xl">
        <div className="skeleton h-64 w-full"></div>
        <div className="card-body">
            <div className="flex justify-between items-start mb-2">
                <div className="skeleton h-6 w-24 rounded-full"></div>
                <div className="skeleton h-6 w-20 rounded"></div>
            </div>
            <div className="skeleton h-7 w-3/4 mb-4"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="card-actions justify-between items-center mt-4">
                <div className="skeleton h-5 w-16"></div>
                <div className="skeleton h-12 w-32"></div>
            </div>
        </div>
    </div>
);

const AllPolicies = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);

    const categories = ["Term Life", "Senior Plan", "Health Insurance", "Family Plan"];

    const { data, isLoading, isError, isPreviousData } = useQuery({
        queryKey: ['policies', currentPage, category, searchTerm],
        queryFn: async () => {
            const res = await axios.get(`https://aegis-life-server.onrender.com/policies`, {
                params: {
                    page: currentPage,
                    limit: 9,
                    category: category,
                    search: searchTerm
                }
            });
            return res.data;
        },
        keepPreviousData: true,
    });

    const policies = data?.policies || [];
    const totalPages = data?.totalPages || 1;

    const handleSearch = (e) => {
        e.preventDefault();
        const newSearchTerm = searchInputRef.current.value;
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
    };

    const handleCategoryFilter = (selectedCategory) => {
        setCategory(selectedCategory);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setCategory('');
        setSearchTerm('');
        setCurrentPage(1);
        if (searchInputRef.current) searchInputRef.current.value = '';
    };

    return (
        <>
            <Helmet>
                <title>Aegis Life | All Policies</title>
                <meta name="description" content="Browse all our insurance policies including term life, health insurance, senior plans, and family coverage options." />
            </Helmet>

            {/* Page Header */}
            <div className="hero min-h-[450px] bg-cover bg-center" style={{ backgroundImage: "url('https://mycoitracking.com/wp-content/uploads/2023/08/Is-a-Certificate-of-Insurance-the-Same-as-an-Insurance-Policy.webp')" }}>
                <div className="hero-overlay"></div>
                <div className="hero-content text-center text-neutral-content">
                    <div className="max-w-2xl">
                        <h1 className="mb-5 text-4xl md:text-5xl font-bold">Our Insurance Policies</h1>
                        <p className="mb-5 text-lg">
                            Discover comprehensive coverage options tailored to protect what matters most to you and your family.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20 md:pb-28">
                {/* Search and Filter Section */}
                <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8 -mt-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        <form onSubmit={handleSearch} className="lg:col-span-2">
                            <label className="label">
                                <span className="label-text font-semibold">Search Policies</span>
                            </label>
                            <div className="join w-full">
                                <input
                                    ref={searchInputRef}
                                    name="search"
                                    className="input input-bordered join-item w-full"
                                    placeholder="Search by name, features..."
                                    defaultValue={searchTerm}
                                />
                                <button type="submit" className="btn btn-primary join-item">
                                    <FaSearch />
                                    Search
                                </button>
                            </div>
                        </form>
                        <div className="lg:col-span-1">
                             <label className="label">
                                <span className="label-text font-semibold">Filter by Category</span>
                            </label>
                            <div className="dropdown w-full">
                                <label tabIndex={0} className="btn btn-outline w-full justify-between">
                                    {category || 'All Categories'}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </label>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                                    <li><a onClick={() => handleCategoryFilter('')}>All Categories</a></li>
                                    {categories.map(cat => (
                                        <li key={cat}><a onClick={() => handleCategoryFilter(cat)}>{cat}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {(category || searchTerm) && (
                        <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-base-200">
                            <span className="text-sm font-semibold">Active filters:</span>
                            {category && (
                                <div className="badge badge-primary gap-2">
                                    {category}
                                    <button onClick={() => setCategory('')} className="text-xl leading-none">&times;</button>
                                </div>
                            )}
                            {searchTerm && (
                                <div className="badge badge-secondary gap-2">
                                    "{searchTerm}"
                                    <button onClick={() => setSearchTerm('')} className="text-xl leading-none">&times;</button>
                                </div>
                            )}
                            <button onClick={clearFilters} className="btn btn-ghost btn-sm underline">
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-12">
                    {/* Results Count and Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(9).keys()].map(i => <PolicyCardSkeleton key={i} />)}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16">
                            <FaSadTear className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Policies</h3>
                            <p className="text-base-content/70 mt-2">Please check your connection and try again later.</p>
                        </div>
                    ) : policies.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-100 transition-opacity duration-500" style={{ opacity: isPreviousData ? 0.6 : 1 }}>
                                {policies.map(policy => (
                                    <div key={policy._id} className="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
                                        <figure className="overflow-hidden h-64">
                                            <img
                                                src={policy.image}
                                                alt={policy.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </figure>
                                        <div className="card-body flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="badge badge-secondary">{policy.category}</div>
                                                {policy.premium && (
                                                    <div className="text-lg font-bold text-primary">${policy.premium}/mo</div>
                                                )}
                                            </div>
                                            <h2 className="card-title text-xl font-bold flex-grow">{policy.title}</h2>
                                            <div className="card-actions justify-between items-center mt-4">
                                                <div className="flex items-center gap-1 font-semibold">
                                                    <FaStar className="text-yellow-400" />
                                                    {policy.rating || '4.5'}
                                                </div>
                                                <Link to={`/policy/${policy._id}`} className="btn btn-primary">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-16">
                                    <div className="join">
                                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="join-item btn">«</button>
                                        {[...Array(totalPages).keys()].map(num => (
                                            <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`join-item btn ${currentPage === num + 1 ? 'btn-active btn-primary' : ''}`}>
                                                {num + 1}
                                            </button>
                                        ))}
                                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="join-item btn">»</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <FaSadTear className="text-7xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No policies found</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                No policies match your current search criteria. Try adjusting your filters or search terms.
                            </p>
                            <button onClick={clearFilters} className="btn btn-primary">
                                Clear Filters & Show All
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AllPolicies;