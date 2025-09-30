import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const PolicyDetails = () => {
    const { id } = useParams();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5000/policies/${id}`)
            .then(res => {
                setPolicy(res.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching policy details:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (!policy) {
        return <div className="text-center my-10 text-2xl">Policy not found.</div>;
    }

    return (
        <>
            <Helmet><title>{`Aegis Life | ${policy.title}`}</title></Helmet>
            <div className="container mx-auto px-4 py-12">
                <div className="card lg:card-side bg-base-100 shadow-xl">
                    <figure className="lg:w-1/3"><img src={policy.image} alt={policy.title} className="w-full h-full object-cover" /></figure>
                    <div className="card-body lg:w-2/3">
                        <h1 className="card-title text-4xl font-bold">{policy.title}</h1>
                        <p className="badge badge-secondary my-2">{policy.category}</p>
                        <p className="mt-4">{policy.details}</p>
                        <div className="stats shadow mt-6">
                            <div className="stat">
                                <div className="stat-title">Max Coverage</div>
                                <div className="stat-value text-primary">{policy.coverage}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Term Length</div>
                                <div className="stat-value text-secondary">{policy.term}</div>
                            </div>
                        </div>
                        <div className="card-actions justify-end mt-8">
                            <Link to={`/quote/${policy._id}`} className="btn btn-primary btn-lg">Get a Quote</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyDetails;