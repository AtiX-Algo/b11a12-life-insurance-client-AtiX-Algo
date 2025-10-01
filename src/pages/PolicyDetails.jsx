import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaChevronRight, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton Component for a better loading experience
const PolicyDetailsSkeleton = () => (
    <div>
        <div className="bg-base-200 py-8">
            <div className="container mx-auto px-4">
                <div className="skeleton h-5 w-64 mb-6"></div>
                <div className="skeleton h-12 w-3/4"></div>
            </div>
        </div>
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                    <div className="skeleton h-96 w-full rounded-lg"></div>
                </div>
                <div className="lg:col-span-3">
                    <div className="skeleton h-6 w-32 mb-4 rounded-full"></div>
                    <div className="skeleton h-8 w-full mb-2"></div>
                    <div className="skeleton h-8 w-5/6 mb-6"></div>
                    <div className="skeleton h-4 w-full mb-2"></div>
                    <div className="skeleton h-4 w-full mb-2"></div>
                    <div className="skeleton h-4 w-3/4 mb-8"></div>
                    <div className="skeleton h-24 w-full rounded-lg mb-8"></div>
                    <div className="skeleton h-16 w-48 ml-auto rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

const PolicyDetails = () => {
    const { id } = useParams();

    const { data: policy, isLoading, isError } = useQuery({
        queryKey: ['policy', id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:5000/policies/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return <PolicyDetailsSkeleton />;
    }

    if (isError || !policy) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                 <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Policy Not Found</h2>
                <p className="text-base-content/70 mb-6">We couldn't find the policy you're looking for.</p>
                <Link to="/policies" className="btn btn-primary">
                    View All Policies
                </Link>
            </div>
        );
    }

    // Dummy features if not present in the API response
    const features = policy.features || [
        "24/7 customer support",
        "Flexible payment options",
        "Easy online claim process",
        "Comprehensive coverage for peace of mind"
    ];

    return (
        <>
            <Helmet>
                <title>{`Aegis Life | ${policy.title}`}</title>
            </Helmet>

            {/* Breadcrumb and Title Header */}
            <div className="bg-base-200 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-sm breadcrumbs mb-4">
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/policies">Policies</Link></li>
                            <li>{policy.title}</li>
                        </ul>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">{policy.title}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Left Column: Image */}
                    <div className="lg:col-span-2">
                        <img
                            src={policy.image}
                            alt={policy.title}
                            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-3">
                        <div className="badge badge-secondary badge-lg mb-4">{policy.category}</div>
                        <p className="text-lg leading-relaxed text-base-content/80">
                            {policy.details}
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Key Features</h2>
                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <FaCheckCircle className="text-success mr-3 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-center">
                             <div className="card bg-base-200 p-4 rounded-lg">
                                <div className="text-sm font-semibold text-base-content/70">Max Coverage</div>
                                <div className="text-2xl font-bold text-primary">{policy.coverage}</div>
                            </div>
                             <div className="card bg-base-200 p-4 rounded-lg">
                                <div className="text-sm font-semibold text-base-content/70">Term Length</div>
                                <div className="text-2xl font-bold text-secondary">{policy.term}</div>
                            </div>
                             <div className="card bg-base-200 p-4 rounded-lg">
                                <div className="text-sm font-semibold text-base-content/70">Starting From</div>
                                <div className="text-2xl font-bold">${policy.premium || '99'}/mo</div>
                            </div>
                        </div>

                        <div className="text-right mt-10">
                            <Link to={`/quote/${policy._id}`} className="btn btn-primary btn-lg">
                                Get a Free Quote
                                <FaChevronRight className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyDetails;