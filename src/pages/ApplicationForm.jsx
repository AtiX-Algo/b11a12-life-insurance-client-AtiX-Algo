import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const ApplicationForm = () => {
    const { id } = useParams(); // In a real app, you'd fetch policy details again here
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            applicantName: user?.displayName,
            applicantEmail: user?.email,
        }
    });

    const onSubmit = data => {
        const applicationData = {
            ...data,
            policyId: id,
            policyTitle: "Sample Policy Title", // In a real app, fetch this from DB using ID
            coverageAmount: "Sample Coverage", // Same as above
        };

        axiosSecure.post('/applications', applicationData)
            .then(res => {
                if(res.data._id) {
                    toast.success('Application submitted successfully!');
                    navigate('/dashboard/my-policies'); // Redirect to a future customer dashboard page
                }
            })
            .catch(err => toast.error('Submission failed. Please try again.' , err));
    };

    return (
        <>
            <Helmet><title>Aegis Life | Application</title></Helmet>
            <div className="max-w-4xl mx-auto p-8 bg-base-200 my-10 rounded-lg">
                <h1 className="text-3xl font-bold text-center mb-8">Insurance Application Form</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="label"><span className="label-text">Full Name</span></label>
                        <input type="text" {...register("applicantName", { required: true })} className="input input-bordered w-full" readOnly />
                    </div>
                    <div>
                        <label className="label"><span className="label-text">Email Address</span></label>
                        <input type="email" {...register("applicantEmail", { required: true })} className="input input-bordered w-full" readOnly />
                    </div>
                     <div>
                        <label className="label"><span className="label-text">Full Address</span></label>
                        <input type="text" {...register("applicantAddress", { required: true })} placeholder="Your full address" className="input input-bordered w-full" />
                        {errors.applicantAddress && <span className="text-red-600">This field is required</span>}
                    </div>
                    {/* Add more fields as needed: Nominee, Health, etc. */}
                    <button type="submit" className="btn btn-primary w-full mt-8">Submit Application</button>
                </form>
            </div>
        </>
    );
};

export default ApplicationForm;