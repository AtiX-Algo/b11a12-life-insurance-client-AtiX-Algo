import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import useAxiosSecure from '../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FaUserEdit, FaUsers, FaHeartbeat, FaFileContract, FaExclamationTriangle } from 'react-icons/fa';

// --- Helper Components for Multi-Step Form ---

const Step1_PersonalDetails = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-3"><FaUserEdit className="text-primary"/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label"><span className="label-text">Full Name</span></label>
                    <input type="text" {...register("applicantName")} className="input input-bordered w-full bg-base-200" readOnly />
                </div>
                <div>
                    <label className="label"><span className="label-text">Email Address</span></label>
                    <input type="email" {...register("applicantEmail")} className="input input-bordered w-full bg-base-200" readOnly />
                </div>
            </div>
            <div>
                <label className="label"><span className="label-text">Full Address</span></label>
                <input type="text" {...register("applicantAddress", { required: "Address is required" })} placeholder="Your full address" className={`input input-bordered w-full ${errors.applicantAddress && 'input-error'}`} />
                {errors.applicantAddress && <span className="text-error text-sm">{errors.applicantAddress.message}</span>}
            </div>
            {/* --- FIX: ADDED NID Number Field --- */}
            <div>
                <label className="label"><span className="label-text">NID Number</span></label>
                <input type="text" {...register("nidNumber", { required: "NID number is required", pattern: { value: /^[0-9]{10,17}$/, message: "Please enter a valid NID number" }})} placeholder="Your National ID Number" className={`input input-bordered w-full ${errors.nidNumber && 'input-error'}`} />
                {errors.nidNumber && <span className="text-error text-sm">{errors.nidNumber.message}</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="label"><span className="label-text">Phone Number</span></label>
                    <input type="tel" {...register("phoneNumber", { required: "Phone number is required", pattern: { value: /^[0-9+-\s]{10,}$/, message: "Please enter a valid phone number" }})} placeholder="Your phone number" className={`input input-bordered w-full ${errors.phoneNumber && 'input-error'}`} />
                    {errors.phoneNumber && <span className="text-error text-sm">{errors.phoneNumber.message}</span>}
                </div>
                <div>
                    <label className="label"><span className="label-text">Date of Birth</span></label>
                    <input type="date" {...register("dateOfBirth", { required: "Date of birth is required" })} className={`input input-bordered w-full ${errors.dateOfBirth && 'input-error'}`} />
                    {errors.dateOfBirth && <span className="text-error text-sm">{errors.dateOfBirth.message}</span>}
                </div>
            </div>
        </div>
    );
};

const Step2_NomineeDetails = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-6 animate-fadeIn">
             <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-3"><FaUsers className="text-primary"/> Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label"><span className="label-text">Nominee Name</span></label>
                    <input type="text" {...register("nomineeName", { required: "Nominee name is required" })} placeholder="Full name of your nominee" className={`input input-bordered w-full ${errors.nomineeName && 'input-error'}`} />
                    {errors.nomineeName && <span className="text-error text-sm">{errors.nomineeName.message}</span>}
                </div>
                <div>
                    <label className="label"><span className="label-text">Relationship with Nominee</span></label>
                    <input type="text" {...register("nomineeRelationship", { required: "Relationship is required" })} placeholder="e.g., Spouse, Son, Daughter" className={`input input-bordered w-full ${errors.nomineeRelationship && 'input-error'}`} />
                    {errors.nomineeRelationship && <span className="text-error text-sm">{errors.nomineeRelationship.message}</span>}
                </div>
            </div>
            {/* --- FIX: ADDED Nominee Contact Field --- */}
            <div>
                <label className="label"><span className="label-text">Nominee Contact Number</span></label>
                <input type="tel" {...register("nomineeContact", { required: "Nominee contact is required", pattern: { value: /^[0-9+-\s]{10,}$/, message: "Please enter a valid phone number" }})} placeholder="Nominee's phone number" className={`input input-bordered w-full ${errors.nomineeContact && 'input-error'}`} />
                {errors.nomineeContact && <span className="text-error text-sm">{errors.nomineeContact.message}</span>}
            </div>
        </div>
    );
};

const Step3_HealthDeclaration = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
         <div className="space-y-6 animate-fadeIn">
             <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-3"><FaHeartbeat className="text-primary"/> Health & Declarations</h3>
            <div>
                <label className="label"><span className="label-text">Please disclose any major health conditions (optional)</span></label>
                <textarea {...register("healthInfo")} className="textarea textarea-bordered w-full h-24" placeholder="e.g., Diabetes, Hypertension, Heart conditions, etc..."></textarea>
            </div>
            {/* --- FIX: ADDED Health Declaration Checkbox --- */}
            <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-4 border rounded-lg hover:bg-base-200">
                    <input type="checkbox" {...register("healthDeclaration", { required: "You must confirm the health declaration" })} className="checkbox checkbox-primary" />
                    <span className="label-text">I declare that the health information provided is accurate and complete to the best of my knowledge.</span>
                </label>
                {errors.healthDeclaration && <span className="text-error text-sm mt-1">{errors.healthDeclaration.message}</span>}
            </div>
             <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-4 border rounded-lg hover:bg-base-200">
                    <input type="checkbox" {...register("termsAccepted", { required: "You must accept the terms and conditions" })} className="checkbox checkbox-primary" />
                    <span className="label-text">I have read and agree to the <a href="#" className="link link-primary">terms and conditions</a> of this insurance policy.</span>
                </label>
                {errors.termsAccepted && <span className="text-error text-sm mt-1">{errors.termsAccepted.message}</span>}
            </div>
        </div>
    );
};

const Step4_Review = () => {
    const { getValues } = useFormContext();
    const allData = getValues();
    return (
         <div className="space-y-4 animate-fadeIn">
             <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-3"><FaFileContract className="text-primary"/> Review Your Application</h3>
            <div className="bg-base-100 p-6 rounded-lg space-y-4">
                {Object.entries(allData).map(([key, value]) => {
                    const formattedValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
                    return value && (
                        <div key={key} className="grid grid-cols-3 gap-4 items-center">
                            <strong className="capitalize col-span-1">{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                            <span className="col-span-2 break-words">{String(formattedValue)}</span>
                        </div>
                    );
                })}
            </div>
             <div className="alert alert-info mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Please review all information carefully before submitting. This cannot be changed later.</span>
            </div>
        </div>
    );
};

// --- Main Application Form Component ---

const ApplicationForm = () => {
    // Removed unused id parameter
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();
    const quoteDetails = location.state?.quoteDetails;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const methods = useForm({
        defaultValues: {
            applicantName: user?.displayName || '',
            applicantEmail: user?.email || '',
        }
    });

    if (!quoteDetails) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <FaExclamationTriangle className="text-7xl text-warning mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Quote Information Missing</h2>
                <p className="text-base-content/70 mb-6 max-w-md">To apply for a policy, you must first get a personalized quote. Please start by finding a policy and calculating your premium.</p>
                <Link to="/policies" className="btn btn-primary">Find a Policy</Link>
            </div>
        );
    }
    
    const onSubmit = data => {
        setIsSubmitting(true);
        
        // --- FIX: Constructing the data object to EXACTLY match the schema ---
        const applicationData = {
            applicantName: data.applicantName,
            applicantEmail: data.applicantEmail,
            applicantAddress: data.applicantAddress,
            nidNumber: data.nidNumber,
            phoneNumber: data.phoneNumber,
            dateOfBirth: data.dateOfBirth,
            nomineeName: data.nomineeName,
            nomineeRelationship: data.nomineeRelationship,
            nomineeContact: data.nomineeContact,
            healthDeclaration: data.healthDeclaration,
            termsAccepted: data.termsAccepted,
            healthInfo: data.healthInfo || '',
            policyId: quoteDetails.policyId,
            policyTitle: quoteDetails.policyTitle,
            coverageAmount: String(quoteDetails.coverageAmount), // Convert to String
            estimatedPremium: String(quoteDetails.estimatedPremium), // Convert to String
            submissionDate: new Date().toISOString(), // Correct field name
            status: 'Pending'
        };

        toast.promise(
            axiosSecure.post('/applications', applicationData),
            {
                loading: 'Submitting your application...',
                success: (res) => {
                    setIsSubmitting(false);
                    navigate('/dashboard/my-policies', { state: { applicationId: res.data._id } });
                    return 'Application submitted successfully!';
                },
                error: (err) => {
                    setIsSubmitting(false);
                    console.error('Submission error:', err.response);
                    return err.response?.data?.message || 'Submission failed. Please try again.';
                }
            }
        );
    };

    const handleNext = async () => {
        const fieldsToValidate = {
            1: ["applicantAddress", "nidNumber", "phoneNumber", "dateOfBirth"],
            2: ["nomineeName", "nomineeRelationship", "nomineeContact"],
            3: ["healthDeclaration", "termsAccepted"],
        }[step];

        const isValid = await methods.trigger(fieldsToValidate);
        if (isValid && step < 4) setStep(step + 1);
    };
    const handlePrev = () => setStep(step - 1);
    
    const steps = [
        { num: 1, title: 'Personal' },
        { num: 2, title: 'Nominee' },
        { num: 3, title: 'Declaration' },
        { num: 4, title: 'Review' }
    ];

    return (
        <FormProvider {...methods}>
            <Helmet><title>Aegis Life | Application for {quoteDetails.policyTitle}</title></Helmet>
             <div className="bg-base-200 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold">Insurance Application</h1>
                    <p className="text-base-content/70 mt-1">You're applying for: <strong className="text-primary">{quoteDetails.policyTitle}</strong></p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                         <ul className="steps w-full mb-8">
                            {steps.map(s => (
                                <li key={s.num} className={`step ${step >= s.num ? 'step-primary' : ''}`}>{s.title}</li>
                            ))}
                        </ul>

                        <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-base-100 p-8 rounded-lg shadow-md">
                            {step === 1 && <Step1_PersonalDetails />}
                            {step === 2 && <Step2_NomineeDetails />}
                            {step === 3 && <Step3_HealthDeclaration />}
                            {step === 4 && <Step4_Review />}

                            <div className="flex justify-between mt-10">
                                {step > 1 && <button type="button" onClick={handlePrev} className="btn">Previous</button>}
                                <div className="ml-auto">
                                    {step < 4 && <button type="button" onClick={handleNext} className="btn btn-primary">Next</button>}
                                    {step === 4 && (
                                        <button type="submit" disabled={isSubmitting} className="btn btn-secondary">
                                            {isSubmitting && <span className="loading loading-spinner"></span>}
                                            Submit Application
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-lg sticky top-28">
                            <div className="card-body">
                                 <h2 className="card-title">Quote Summary</h2>
                                 <div className="divider my-1"></div>
                                <p><strong>Policy:</strong> {quoteDetails.policyTitle}</p>
                                <p><strong>Coverage:</strong> ${parseInt(quoteDetails.coverageAmount).toLocaleString()}</p>
                                <p><strong>Applicant Age:</strong> {quoteDetails.age} years</p>
                                <div className="text-center bg-base-200 p-4 rounded-lg my-4">
                                    <div className="text-lg">Estimated Premium</div>
                                    <div className="text-3xl font-bold text-primary">${quoteDetails.estimatedPremium}<span className="text-lg font-normal text-base-content/70">/mo</span></div>
                                </div>
                                <p className="text-xs text-base-content/60 text-center">Your final rate is subject to full underwriting review.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default ApplicationForm;