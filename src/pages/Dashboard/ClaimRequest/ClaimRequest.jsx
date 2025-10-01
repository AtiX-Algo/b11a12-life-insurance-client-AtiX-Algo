import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaPlus, FaHistory, FaExclamationTriangle } from 'react-icons/fa';

// Environment variables for ImgBB
const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;
const imgbb_api_url = `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`;

// Skeleton component
const ClaimListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-100 rounded-lg shadow items-center">
                <div className="md:col-span-2 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-10 w-28 rounded-lg ml-auto"></div>
            </div>
        ))}
    </div>
);

const ClaimRequest = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [selectedApp, setSelectedApp] = useState(null);

    // Fetch the user's applications
    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ['applications', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/customer/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const mutation = useMutation({
        mutationFn: ({ id, claimData }) => axiosSecure.patch(`/applications/claim/${id}`, claimData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications', user?.email] });
            document.getElementById('claim_modal').close();
        },
        onError: () => toast.error('Claim submission failed.')
    });

    const openClaimModal = (app) => {
        setSelectedApp(app);
        reset();
        document.getElementById('claim_modal').showModal();
    };

    const onSubmit = async (data) => {
        if (!selectedApp) return;

        const toastId = toast.loading('Uploading document...');
        
        try {
            // 1. Upload image to ImgBB
            const formData = new FormData();
            formData.append('image', data.document[0]);
            
            const res = await axios.post(imgbb_api_url, formData);

            if (res.data.success) {
                toast.loading('Submitting claim...', { id: toastId });
                // 2. Prepare data for our backend
                const claimData = {
                    claimDetails: data.claimDetails,
                    documentUrl: res.data.data.display_url,
                };
                // 3. Call the mutation
                mutation.mutate({ id: selectedApp._id, claimData }, {
                    onSuccess: () => toast.success('Claim submitted successfully!', { id: toastId }),
                    onError: () => toast.error('Claim submission failed.', { id: toastId })
                });
            } else {
                toast.error('Document upload failed.', { id: toastId });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document.', { id: toastId });
        }
    };

    const eligiblePolicies = applications.filter(app => app.status === 'Approved' && app.claimStatus === 'None');
    const claimedPolicies = applications.filter(app => app.claimStatus !== 'None');

    const claimStatusStyles = {
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-error',
        None: 'badge-ghost',
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Request a Claim</title></Helmet>
            <div className="card-body">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Request an Insurance Claim</h1>
                    <p className="text-base-content/70">Submit a claim for any of your eligible, approved policies.</p>
                </div>

                {isLoading ? <ClaimListSkeleton /> : isError ? (
                     <div className="text-center py-16">
                        <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold">Failed to Load Policies</h3>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Eligible Policies Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Eligible Policies for Claim ({eligiblePolicies.length})</h2>
                            {eligiblePolicies.length > 0 ? (
                                <div className="space-y-4">
                                    {eligiblePolicies.map(app => (
                                        <div key={app._id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                            <div className="md:col-span-2">
                                                <p className="font-bold">{app.policyTitle}</p>
                                                <p className="text-sm text-base-content/60">Coverage: ${app.coverageAmount?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-end">
                                                <button onClick={() => openClaimModal(app)} className="btn btn-primary"><FaPlus /> Request Claim</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-base-200 rounded-lg">
                                    <p className="text-lg">No eligible policies found for a claim.</p>
                                    <p className="text-sm text-base-content/60 mt-1">Only approved policies without an existing claim can be used.</p>
                                </div>
                            )}
                        </div>

                        {/* Claim History Section */}
                        {claimedPolicies.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaHistory /> Your Claim History</h2>
                                <div className="space-y-4">
                                    {claimedPolicies.map(app => (
                                        <div key={app._id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                            <div className="md:col-span-2">
                                                <p className="font-bold">{app.policyTitle}</p>
                                                <p className="text-sm text-base-content/60">Coverage: ${app.coverageAmount?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-end">
                                                <span className={`badge ${claimStatusStyles[app.claimStatus]}`}>{app.claimStatus}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Claim Modal */}
            <dialog id="claim_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Claim for: {selectedApp?.policyTitle}</h3>
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => reset()}>✕</button></form>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Claim Details *</span></label>
                            <textarea {...register("claimDetails", { required: "Claim details are required" })} className={`textarea textarea-bordered h-32 ${errors.claimDetails ? 'textarea-error' : ''}`} placeholder="Please provide a detailed reason for your claim..."></textarea>
                            {errors.claimDetails && <span className="text-error text-sm mt-1">{errors.claimDetails.message}</span>}
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Supporting Document *</span></label>
                            <input type="file" {...register("document", { required: "A supporting document is required" })} className={`file-input file-input-bordered w-full ${errors.document ? 'file-input-error' : ''}`} accept="image/*,application/pdf" />
                            {errors.document && <span className="text-error text-sm mt-1">{errors.document.message}</span>}
                            <label className="label"><span className="label-text-alt">Accepted: Images & PDF (Max 5MB)</span></label>
                        </div>
                        <div className="modal-action">
                            <button type="submit" className="btn btn-primary w-full" disabled={mutation.isPending}>
                                {mutation.isPending && <span className="loading loading-spinner"></span>}
                                Submit Claim Request
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ClaimRequest;