import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaVenusMars, FaShieldAlt, FaSmoking, FaArrowRight, FaExclamationTriangle, FaTag } from 'react-icons/fa';

// Skeleton Component
const QuotePageSkeleton = () => (
    <div>
        <div className="bg-base-200 py-8">
            <div className="container mx-auto px-4">
                <div className="skeleton h-5 w-64 mb-6"></div>
                <div className="skeleton h-12 w-3/4"></div>
            </div>
        </div>
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-12 w-full mt-4"></div>
                </div>
                <div className="lg:col-span-1">
                    <div className="skeleton h-64 w-full"></div>
                </div>
            </div>
        </div>
    </div>
);

const promoDiscountMap = {
    DISCOUNT10: 0.10,
    PROMO5: 0.05,
    SUMMER20: 0.20,
};

const QuotePage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [estimatedPremium, setEstimatedPremium] = useState(null);
    const [appliedPromo, setAppliedPromo] = useState(null);

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        defaultValues: {
            age: '',
            gender: 'Male',
            coverageAmount: '',
            isSmoker: 'no',
        }
    });

    // watch form values so we can reset estimated premium when they change
    const formValues = watch();

    // Reset estimated premium whenever relevant form values change
    useEffect(() => {
        setEstimatedPremium(null);
    }, [formValues.age, formValues.gender, formValues.coverageAmount, formValues.isSmoker]);

    // Read query params and state from location
    const searchParams = new URLSearchParams(location.search);
    const promoFromQuery = searchParams.get('promo') || null;
    const referrer = location.state?.referrer || null;
    const incomingFormValues = location.state?.formValues || null;
    const incomingQuoteDetails = location.state?.quoteDetails || null;

    // When the page mounts or the location state changes, prefill the form if values were provided
    useEffect(() => {
        if (incomingFormValues) {
            // Only set fields that exist in incomingFormValues
            reset({
                age: incomingFormValues.age ?? '',
                gender: incomingFormValues.gender ?? 'Male',
                coverageAmount: incomingFormValues.coverageAmount ?? '',
                isSmoker: incomingFormValues.isSmoker ?? 'no',
            });

            // If incoming quote already had an estimated premium, show it
            if (incomingQuoteDetails?.estimatedPremium) {
                setEstimatedPremium(incomingQuoteDetails.estimatedPremium);
            }
        }
        // apply promo from URL if present
        if (promoFromQuery && promoDiscountMap[promoFromQuery]) {
            setAppliedPromo(promoFromQuery);
        } else {
            setAppliedPromo(null);
        }
    }, [incomingFormValues, incomingQuoteDetails, promoFromQuery, reset]);

    const { data: policy, isLoading, isError } = useQuery({
        queryKey: ['policy', id],
        queryFn: async () => {
            const res = await axios.get(`https://aegis-life-server.onrender.com/policies/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const onSubmit = (data) => {
        // Defensive parsing
        const basePremium = parseFloat(policy?.premium) || 100;
        const age = parseInt(data.age, 10) || 18;
        const coverageAmount = parseInt(data.coverageAmount, 10) || 50000;

        let premium = basePremium;
        // age loading: charge per year above 18
        premium += (Math.max(age, 18) - 18) * 2.5;
        // coverage loading
        premium += coverageAmount / 2000;

        if (String(data.gender).toLowerCase() === 'male') premium += 20;
        if (String(data.isSmoker) === 'yes') premium += 100;

        // apply promo discount if valid
        const promoCode = promoFromQuery;
        const discount = promoCode && promoDiscountMap[promoCode] ? promoDiscountMap[promoCode] : 0;
        if (discount > 0) {
            premium = premium * (1 - discount);
        }

        // Round to two decimals
        const formatted = premium.toFixed(2);
        setEstimatedPremium(formatted);
    };

    if (isLoading) return <QuotePageSkeleton />;

    if (isError || !policy) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                 <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Policy Not Found</h2>
                <p className="text-base-content/70 mb-6">We couldn't find the policy to generate a quote.</p>
                <Link to="/policies" className="btn btn-primary">
                    View All Policies
                </Link>
            </div>
        );
    }

    // Build quote details that we will pass to the application route
    const quoteDetailsForApp = {
        policyId: id,
        policyTitle: policy.title,
        estimatedPremium,
        promoApplied: appliedPromo,
        referrer,
        ...formValues,
    };

    return (
        <>
            <Helmet><title>{`Aegis Life | Quote for ${policy.title}`}</title></Helmet>
            
            <div className="bg-base-200 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-sm breadcrumbs mb-4">
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/policies">Policies</Link></li>
                            <li><Link to={`/policy/${id}`}>{policy.title}</Link></li>
                            <li>Quote</li>
                        </ul>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Get a Personalized Quote</h1>

                    {/* Show a little note if we have referrer info or promo */}
                    <div className="flex items-center gap-4 mt-4">
                        {referrer && <div className="badge badge-outline">Referred by: {referrer}</div>}
                        {appliedPromo && (
                            <div className="badge badge-success flex items-center gap-2">
                                <FaTag /> Promo: {appliedPromo}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left side: Form and results */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Age */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Your Age</span></label>
                                    <div className="join">
                                        <span className="join-item btn btn-ghost disabled:bg-base-200"><FaUser /></span>
                                        <input
                                            type="number"
                                            {...register("age", { required: "Age is required", min: { value: 18, message: "Must be 18 or older" }, max: { value: 75, message: "Must be 75 or younger" } })}
                                            className={`input input-bordered join-item w-full ${errors.age ? 'input-error' : ''}`}
                                            placeholder="e.g., 35"
                                        />
                                    </div>
                                    {errors.age && <span className="text-error text-sm mt-1">{errors.age.message}</span>}
                                </div>

                                {/* Gender */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Gender</span></label>
                                     <div className="join">
                                        <span className="join-item btn btn-ghost disabled:bg-base-200"><FaVenusMars /></span>
                                        <select {...register("gender")} className="select select-bordered join-item w-full">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Coverage Amount */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Coverage Amount ($)</span></label>
                                    <div className="join">
                                        <span className="join-item btn btn-ghost disabled:bg-base-200"><FaShieldAlt /></span>
                                        <input
                                            type="number"
                                            {...register("coverageAmount", { required: "Coverage is required", min: { value: 50000, message: "Minimum $50,000" } })}
                                            className={`input input-bordered join-item w-full ${errors.coverageAmount ? 'input-error' : ''}`}
                                            placeholder="e.g., 500000"
                                        />
                                    </div>
                                    {errors.coverageAmount && <span className="text-error text-sm mt-1">{errors.coverageAmount.message}</span>}
                                </div>
                                
                                {/* Smoker */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Are you a smoker?</span></label>
                                    <div className="join">
                                        <span className="join-item btn btn-ghost disabled:bg-base-200"><FaSmoking /></span>
                                        <select {...register("isSmoker")} className="select select-bordered join-item w-full">
                                            <option value="no">No</option>
                                            <option value="yes">Yes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <button type="submit" className="btn btn-primary w-full btn-lg">Calculate Premium</button>
                                {/* Quick apply promo button (fills the promo into the UI, but promo comes from the URL) */}
                                {appliedPromo ? (
                                    <div className="badge badge-outline">{appliedPromo} applied</div>
                                ) : (
                                    promoFromQuery && <div className="badge badge-warning">Promo in URL ({promoFromQuery}) not valid</div>
                                )}
                            </div>
                        </form>
                        
                        {/* Display Estimated Premium */}
                        {estimatedPremium ? (
                            <div className="text-center mt-10 p-6 bg-base-100 rounded-lg shadow-lg border-t-4 border-primary">
                                <h3 className="text-2xl font-bold">Your Estimated Monthly Premium</h3>
                                <p className="text-5xl font-extrabold text-primary my-4">${estimatedPremium}</p>
                                {appliedPromo && (
                                    <p className="text-sm text-success">Promo <strong>{appliedPromo}</strong> applied — {Math.round((promoDiscountMap[appliedPromo] || 0) * 100)}% off</p>
                                )}
                                <p className="text-base-content/70 max-w-md mx-auto">This is an estimate. Your final rate may vary based on a full application and underwriting.</p>
                                <button
                                    onClick={() => navigate(`/application/${id}`, { state: { quoteDetails: quoteDetailsForApp, sourceLocationState: location.state } })}
                                    className="btn btn-secondary btn-lg mt-6"
                                >
                                    Proceed to Application
                                    <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        ) : (
                             <div className="text-center mt-10 p-6 bg-blue-50 border-blue-200 border rounded-lg">
                                <h3 className="text-xl font-semibold text-blue-800">Your quote will appear here.</h3>
                                <p className="text-blue-700/80 mt-1">Fill out the form and click "Calculate Premium" to see your personalized estimate.</p>
                                {incomingQuoteDetails?.estimatedPremium && (
                                    <p className="mt-3 text-sm">Loaded estimate from previous step: ${incomingQuoteDetails.estimatedPremium}</p>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Right side: Policy Info */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-lg sticky top-28">
                            <figure><img src={policy.image} alt={policy.title} className="h-56 w-full object-cover" /></figure>
                            <div className="card-body">
                                <div className="badge badge-secondary">{policy.category}</div>
                                <h2 className="card-title mt-2">{policy.title}</h2>
                                <p className="text-base-content/70 text-sm mt-2">{policy.details?.substring(0, 100) ?? ''}...</p>
                                <div className="divider my-1"></div>
                                <div className="flex justify-between font-semibold">
                                    <span>Coverage:</span>
                                    <span>{policy.coverage}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Term:</span>
                                    <span>{policy.term}</span>
                                </div>
                                <div className="card-actions mt-4">
                                    <Link to={`/policy/${id}`} className="btn btn-outline btn-primary btn-sm w-full">View Full Details</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuotePage;
