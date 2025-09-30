import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const ApplicationForm = () => {
    const { id } = useParams();
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
            policyTitle: "Sample Policy Title",
            coverageAmount: "Sample Coverage",
            applicationDate: new Date().toISOString(),
            status: 'pending'
        };

        axiosSecure.post('/applications', applicationData)
            .then(res => {
                if(res.data._id) {
                    toast.success('Application submitted successfully!');
                    navigate('/dashboard/my-policies');
                }
            })
            .catch(err => {
                console.error('Submission error:', err);
                toast.error('Submission failed. Please try again.');
            });
    };

    return (
        <>
            <Helmet><title>Aegis Life | Application</title></Helmet>
            <div className="max-w-4xl mx-auto p-8 bg-base-200 my-10 rounded-lg">
                <h1 className="text-3xl font-bold text-center mb-8">Insurance Application Form</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Applicant Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label"><span className="label-text">Full Name</span></label>
                            <input 
                                type="text" 
                                {...register("applicantName", { required: true })} 
                                className="input input-bordered w-full" 
                                readOnly 
                            />
                        </div>
                        <div>
                            <label className="label"><span className="label-text">Email Address</span></label>
                            <input 
                                type="email" 
                                {...register("applicantEmail", { required: true })} 
                                className="input input-bordered w-full" 
                                readOnly 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label"><span className="label-text">Full Address</span></label>
                        <input 
                            type="text" 
                            {...register("applicantAddress", { required: "Address is required" })} 
                            placeholder="Your full address" 
                            className="input input-bordered w-full" 
                        />
                        {errors.applicantAddress && (
                            <span className="text-red-600 text-sm">{errors.applicantAddress.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="label"><span className="label-text">NID Number</span></label>
                        <input 
                            type="text" 
                            {...register("nidNumber", { 
                                required: "NID number is required",
                                pattern: {
                                    value: /^[0-9]{10,17}$/,
                                    message: "Please enter a valid NID number"
                                }
                            })} 
                            placeholder="Your National ID Number" 
                            className="input input-bordered w-full" 
                        />
                        {errors.nidNumber && (
                            <span className="text-red-600 text-sm">{errors.nidNumber.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="label"><span className="label-text">Phone Number</span></label>
                        <input 
                            type="tel" 
                            {...register("phoneNumber", { 
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9+-\s]+$/,
                                    message: "Please enter a valid phone number"
                                }
                            })} 
                            placeholder="Your phone number" 
                            className="input input-bordered w-full" 
                        />
                        {errors.phoneNumber && (
                            <span className="text-red-600 text-sm">{errors.phoneNumber.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="label"><span className="label-text">Date of Birth</span></label>
                        <input 
                            type="date" 
                            {...register("dateOfBirth", { 
                                required: "Date of birth is required",
                                validate: {
                                    validAge: value => {
                                        const birthDate = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - birthDate.getFullYear();
                                        return age >= 18 || "You must be at least 18 years old";
                                    }
                                }
                            })} 
                            className="input input-bordered w-full" 
                        />
                        {errors.dateOfBirth && (
                            <span className="text-red-600 text-sm">{errors.dateOfBirth.message}</span>
                        )}
                    </div>

                    {/* Nominee Details */}
                    <div className="divider">Nominee Details</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label"><span className="label-text">Nominee Name</span></label>
                            <input 
                                type="text" 
                                {...register("nomineeName", { required: "Nominee name is required" })} 
                                placeholder="Full name of your nominee" 
                                className="input input-bordered w-full" 
                            />
                            {errors.nomineeName && (
                                <span className="text-red-600 text-sm">{errors.nomineeName.message}</span>
                            )}
                        </div>
                        <div>
                            <label className="label"><span className="label-text">Relationship</span></label>
                            <input 
                                type="text" 
                                {...register("nomineeRelationship", { required: "Relationship is required" })} 
                                placeholder="e.g., Spouse, Son, Daughter" 
                                className="input input-bordered w-full" 
                            />
                            {errors.nomineeRelationship && (
                                <span className="text-red-600 text-sm">{errors.nomineeRelationship.message}</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="label"><span className="label-text">Nominee Contact Number</span></label>
                        <input 
                            type="tel" 
                            {...register("nomineeContact", { 
                                required: "Nominee contact number is required",
                                pattern: {
                                    value: /^[0-9+-\s]+$/,
                                    message: "Please enter a valid phone number"
                                }
                            })} 
                            placeholder="Nominee's phone number" 
                            className="input input-bordered w-full" 
                        />
                        {errors.nomineeContact && (
                            <span className="text-red-600 text-sm">{errors.nomineeContact.message}</span>
                        )}
                    </div>

                    {/* Health Disclosure */}
                    <div className="divider">Health Disclosure</div>

                    <div>
                        <label className="label"><span className="label-text">Please disclose any major health conditions (optional)</span></label>
                        <textarea 
                            {...register("healthInfo")} 
                            className="textarea textarea-bordered w-full h-24" 
                            placeholder="e.g., Diabetes, Hypertension, Heart conditions, etc..."
                        ></textarea>
                    </div>

                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input 
                                type="checkbox" 
                                {...register("healthDeclaration", { 
                                    required: "You must confirm the health declaration" 
                                })} 
                                className="checkbox checkbox-primary" 
                            />
                            <span className="label-text">
                                I declare that the health information provided above is accurate and complete to the best of my knowledge.
                            </span>
                        </label>
                        {errors.healthDeclaration && (
                            <span className="text-red-600 text-sm mt-1">{errors.healthDeclaration.message}</span>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input 
                                type="checkbox" 
                                {...register("termsAccepted", { 
                                    required: "You must accept the terms and conditions" 
                                })} 
                                className="checkbox checkbox-primary" 
                            />
                            <span className="label-text">
                                I have read and agree to the terms and conditions of this insurance policy.
                            </span>
                        </label>
                        {errors.termsAccepted && (
                            <span className="text-red-600 text-sm mt-1">{errors.termsAccepted.message}</span>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-8 text-lg py-3">
                        Submit Application
                    </button>
                </form>
            </div>
        </>
    );
};

export default ApplicationForm;