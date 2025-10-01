import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;
const imgbb_api_url = `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`;

const ClaimRequest = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();
    const [selectedApp, setSelectedApp] = useState(null);

    // Fetch the user's applications
    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['applications', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/customer/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Updated mutation to include documentUrl
    const mutation = useMutation({
        mutationFn: ({ id, claimData }) => axiosSecure.patch(`/applications/claim/${id}`, claimData),
        onSuccess: () => {
            toast.success('Claim submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['applications', user?.email] });
            document.getElementById('claim_modal').close();
            reset();
        },
        onError: () => toast.error('Claim submission failed.')
    });

    const openClaimModal = (app) => {
        setSelectedApp(app);
        document.getElementById('claim_modal').showModal();
    };

    // Updated onSubmit to handle file upload
    const onSubmit = async (data) => {
        if (!selectedApp) return;

        const toastId = toast.loading('Uploading document and submitting claim...');

        try {
            // 1. Upload image to ImgBB
            const formData = new FormData();
            formData.append('image', data.document[0]);
            
            const res = await axios.post(imgbb_api_url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // 2. If upload is successful, prepare data for our backend
                const claimData = {
                    claimDetails: data.claimDetails,
                    documentUrl: res.data.data.display_url,
                    claimStatus: 'Pending' // Set claim status to pending when submitting
                };
                // 3. Call the mutation to save data to our backend
                mutation.mutate({ id: selectedApp._id, claimData });
                toast.dismiss(toastId);
            } else {
                toast.error('Document upload failed.', { id: toastId });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document.', { id: toastId });
        }
    };

    // Filter for policies that are approved and not already claimed
    const eligiblePolicies = applications.filter(app => 
        app.status === 'Approved' && app.claimStatus === 'None'
    );

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet>
                <title>Dashboard | Request a Claim</title>
            </Helmet>
            <h1 className="text-3xl font-bold mb-6">Request a Claim</h1>

            {eligiblePolicies.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600">No eligible policies found for claim.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Only approved policies without existing claims can be used to request claims.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Policy Title</th>
                                <th>Coverage</th>
                                <th>Claim Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eligiblePolicies.map((app) => (
                                <tr key={app._id}>
                                    <td>{app.policyTitle}</td>
                                    <td>${app.coverageAmount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${
                                            app.claimStatus === 'Pending' ? 'badge-warning' :
                                            app.claimStatus === 'Approved' ? 'badge-success' :
                                            app.claimStatus === 'Rejected' ? 'badge-error' : 'badge-ghost'
                                        }`}>
                                            {app.claimStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => openClaimModal(app)}
                                            className="btn btn-sm btn-secondary"
                                            disabled={app.claimStatus !== 'None'}
                                        >
                                            Request Claim
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Claim Modal - Updated */}
            <dialog id="claim_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Claim for: {selectedApp?.policyTitle}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                        Coverage Amount: ${selectedApp?.coverageAmount?.toLocaleString()}
                    </p>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Claim Details *</span>
                            </label>
                            <textarea
                                {...register("claimDetails", { 
                                    required: "Claim details are required",
                                    minLength: {
                                        value: 10,
                                        message: "Claim details must be at least 10 characters long"
                                    }
                                })}
                                className="textarea textarea-bordered w-full h-32"
                                placeholder="Please provide a detailed reason for your claim, including what happened, when it happened, and any other relevant information..."
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="label">
                                <span className="label-text">Supporting Document (PDF/Image) *</span>
                            </label>
                            <input
                                type="file"
                                {...register("document", { 
                                    required: "Supporting document is required",
                                    validate: {
                                        fileSize: (file) => {
                                            if (file[0]?.size > 5 * 1024 * 1024) { // 5MB limit
                                                return "File size must be less than 5MB";
                                            }
                                            return true;
                                        },
                                        fileType: (file) => {
                                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
                                            if (file[0] && !allowedTypes.includes(file[0].type)) {
                                                return "Only images (JPEG, PNG, GIF) and PDF files are allowed";
                                            }
                                            return true;
                                        }
                                    }
                                })}
                                className="file-input file-input-bordered w-full"
                                accept=".jpg,.jpeg,.png,.gif,.pdf,.JPG,.JPEG,.PNG,.GIF,.PDF"
                            />
                            <label className="label">
                                <span className="label-text-alt text-gray-500">
                                    Accepted formats: JPG, PNG, GIF, PDF (Max 5MB)
                                </span>
                            </label>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary w-full" 
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Submitting Claim...
                                </>
                            ) : (
                                'Submit Claim'
                            )}
                        </button>
                    </form>
                    
                    <div className="modal-action">
                        <button 
                            type="button" 
                            onClick={() => {
                                document.getElementById('claim_modal').close();
                                reset();
                            }} 
                            className="btn"
                            disabled={mutation.isPending}
                        >
                            Close
                        </button>
                    </div>
                </div>
                
                {/* Modal backdrop close */}
                <form method="dialog" className="modal-backdrop">
                    <button disabled={mutation.isPending}>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default ClaimRequest;