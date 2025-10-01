import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const AllPolicies = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ["Term Life", "Senior Plan", "Health Insurance", "Family Plan"];

    // Refactored data fetching with Tanstack Query
    const { data, isLoading, isError } = useQuery({
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
        const searchInput = e.target.search.value;
        setSearchTerm(searchInput);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleCategoryFilter = (selectedCategory) => {
        setCategory(selectedCategory);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setCategory('');
        setSearchTerm('');
        setCurrentPage(1);
        // Reset the search input field
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput) searchInput.value = '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-lg">Loading policies...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-xl">Failed to load policies.</p>
                    <p className="mt-2">Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Aegis Life | All Policies</title>
                <meta name="description" content="Browse all our insurance policies including term life, health insurance, senior plans, and family coverage options." />
            </Helmet>
            
            <div className="container mx-auto px-4 py-8 min-h-screen">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our Insurance Policies
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover comprehensive coverage options tailored to protect what matters most to you and your family.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-base-200 rounded-lg p-6 mb-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                        <div className="join w-full max-w-lg">
                            <input 
                                name="search" 
                                className="input input-bordered join-item w-full" 
                                placeholder="Search policies by name, description, or features..."
                                defaultValue={searchTerm}
                            />
                            <button type="submit" className="btn btn-primary join-item">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Category Filters */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            <button 
                                onClick={() => handleCategoryFilter('')} 
                                className={`btn ${category === '' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                All Policies
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => handleCategoryFilter(cat)} 
                                    className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        {/* Active Filters Display */}
                        {(category || searchTerm) && (
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {category && (
                                    <span className="badge badge-primary gap-2">
                                        Category: {category}
                                        <button onClick={() => setCategory('')}>×</button>
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="badge badge-secondary gap-2">
                                        Search: "{searchTerm}"
                                        <button onClick={() => setSearchTerm('')}>×</button>
                                    </span>
                                )}
                                <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing {policies.length} of {data?.total || 0} policies
                        {searchTerm && ` for "${searchTerm}"`}
                        {category && ` in ${category}`}
                    </p>
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                </div>

                {/* Policies Grid */}
                {policies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {policies.map(policy => (
                            <div key={policy._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <figure className="overflow-hidden">
                                    <img 
                                        src={policy.image} 
                                        alt={policy.title} 
                                        className="h-64 w-full object-cover hover:scale-105 transition-transform duration-300" 
                                    />
                                </figure>
                                <div className="card-body">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="badge badge-secondary badge-lg">{policy.category}</div>
                                        {policy.premium && (
                                            <div className="text-lg font-bold text-primary">
                                                ${policy.premium}/mo
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="card-title text-xl hover:text-primary transition-colors">
                                        {policy.title}
                                    </h2>
                                    <p className="text-gray-600 flex-grow">
                                        {policy.details?.substring(0, 120)}...
                                    </p>
                                    <div className="card-actions justify-between items-center mt-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            {policy.rating || '4.5'}
                                        </div>
                                        <Link 
                                            to={`/policy/${policy._id}`} 
                                            className="btn btn-primary btn-outline"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // No Results State
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No policies found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || category 
                                    ? `No policies match your search criteria. Try adjusting your filters.`
                                    : `No policies available at the moment. Please check back later.`
                                }
                            </p>
                            {(searchTerm || category) && (
                                <button onClick={clearFilters} className="btn btn-primary">
                                    Show All Policies
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination - Only show if there are multiple pages */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-16">
                        <div className="join">
                            {/* Previous Page Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="join-item btn btn-outline"
                            >
                                «
                            </button>
                            
                            {/* Page Numbers */}
                            {[...Array(totalPages).keys()].map(num => (
                                <button
                                    key={num + 1}
                                    onClick={() => setCurrentPage(num + 1)}
                                    className={`join-item btn ${currentPage === num + 1 ? 'btn-active' : ''}`}
                                >
                                    {num + 1}
                                </button>
                            ))}
                            
                            {/* Next Page Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="join-item btn btn-outline"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AllPolicies;