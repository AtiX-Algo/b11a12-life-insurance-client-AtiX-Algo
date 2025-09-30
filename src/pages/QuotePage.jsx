import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const QuotePage = () => {
    const { id } = useParams();
    const location = useLocation();
    const { register, handleSubmit } = useForm();
    const [estimatedPremium, setEstimatedPremium] = useState(null);

    // Fetch the policy details to display its title
    const { data: policy, isLoading } = useQuery({
        queryKey: ['policy', id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:5000/policies/${id}`);
            return res.data;
        }
    });

    const onSubmit = (data) => {
        // --- This is a sample calculation logic. You can make this more complex. ---
        let premium = 100; // Base premium
        premium += data.age * 2.5; // Add amount based on age
        premium += data.coverageAmount / 2000; // Add amount based on coverage
        if (data.gender === 'male') premium += 20;
        if (data.isSmoker === 'yes') premium += 100;
        setEstimatedPremium(premium.toFixed(2));
    };

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <>
            <Helmet><title>Aegis Life | Get a Quote</title></Helmet>
            <div className="max-w-4xl mx-auto p-8 bg-base-200 my-10 rounded-lg">
                <h1 className="text-3xl font-bold text-center mb-2">Get a Quote For:</h1>
                <h2 className="text-xl font-semibold text-center text-primary mb-8">{policy?.title}</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Your Age</span></label>
                            <input type="number" {...register("age", { required: true, min: 18, max: 70 })} className="input input-bordered" placeholder="e.g., 35" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Gender</span></label>
                            <select {...register("gender")} className="select select-bordered">
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Coverage Amount ($)</span></label>
                            <input type="number" {...register("coverageAmount", { required: true })} className="input input-bordered" placeholder="e.g., 500000" />
                        </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text">Are you a smoker?</span></label>
                            <select {...register("isSmoker")} className="select select-bordered">
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-secondary w-full mt-6">Calculate Premium</button>
                </form>

                {/* Display Estimated Premium */}
                {estimatedPremium && (
                    <div className="text-center mt-10 p-6 bg-base-100 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold">Estimated Monthly Premium</h3>
                        <p className="text-5xl font-extrabold text-primary my-4">${estimatedPremium}</p>
                        <Link to={`/application/${id}`} state={{ quoteDetails: location.state }} className="btn btn-primary btn-lg">
                            Proceed to Application
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default QuotePage;