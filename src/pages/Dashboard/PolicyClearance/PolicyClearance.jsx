import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaEye, FaCheck, FaExclamationTriangle, FaFilePdf } from 'react-icons/fa';

// Skeleton component for a better loading experience
const ClaimListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-100 rounded-lg shadow items-center">
                <div className="md:col-span-2 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-4 w-2/3"></div>
                <div className="skeleton h-10 w-28 rounded-lg ml-auto"></div>
            </div>
        ))}
    </div>
);


const PolicyClearance = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Fetch all pending claims
    const { data: pendingClaims = [], isLoading, isError } = useQuery({
        queryKey: ['pendingClaims'],
        queryFn: async () => {
            const res = await axiosSecure.get('/applications/claims/pending');
            return res.data;
        }
    });

    // Mutation for approving a claim
    const mutation = useMutation({
        mutationFn: (id) => axiosSecure.patch(`/applications/claims/approve/${id}`),
        onSuccess: () => {
            toast.success('Claim approved successfully!');
            queryClient.invalidateQueries({ queryKey: ['pendingClaims'] });
            document.getElementById('details_modal').close();
        },
        onError: () => toast.error('Failed to approve claim.')
    });

    const handleApprove = () => {
        if (!selectedClaim) return;
        
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to approve the claim for ${selectedClaim.applicantName}. This action is final.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Yes, approve it!'
        }).then((result) => {
            if (result.isConfirmed) {
                mutation.mutate(selectedClaim._id);
            }
        });
    };
    
    const openDetailsModal = (claim) => {
        setSelectedClaim(claim);
        document.getElementById('details_modal').showModal();
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Policy Clearance</title></Helmet>
            <div className="card-body">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Policy Claim Clearance</h1>
                    <p className="text-base-content/70">Review and approve pending claims from customers.</p>
                </div>
                
                <div className="space-y-4">
                    {isLoading ? <ClaimListSkeleton /> : isError ? (
                        <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Claims</h3>
                        </div>
                    ) : pendingClaims.length === 0 ? (
                        <div className="text-center py-16 bg-base-200 rounded-lg">
                            <h3 className="text-2xl font-semibold">No Pending Claims</h3>
                            <p className="text-base-content/70 mt-2">There are no claim requests awaiting clearance.</p>
                        </div>
                    ) : (
                        pendingClaims.map((claim) => (
                             <div key={claim._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                <div className="md:col-span-2">
                                    <p className="font-bold">{claim.applicantName}</p>
                                    <p className="text-sm text-base-content/60">{claim.applicantEmail}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">{claim.policyTitle}</p>
                                    <p className="text-xs text-base-content/60">Submitted: {new Date(claim.submissionDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex justify-end items-center gap-2">
                                    <button onClick={() => openDetailsModal(claim)} className="btn btn-sm btn-primary btn-outline">
                                        <FaEye /> View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Details & Approval Modal */}
                <dialog id="details_modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Claim Details</h3>
                        <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>

                        <div className="space-y-4 mt-4">
                            <div>
                                <p className="text-xs uppercase text-base-content/60">Applicant</p>
                                <p className="font-semibold">{selectedClaim?.applicantName}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-base-content/60">Policy</p>
                                <p className="font-semibold">{selectedClaim?.policyTitle}</p>
                            </div>

                             {selectedClaim?.documentUrl && (
                                <div>
                                     <p className="text-xs uppercase text-base-content/60 mb-1">Supporting Document</p>
                                    <a href={selectedClaim.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-primary btn-sm">
                                        <FaFilePdf /> View Document
                                    </a>
                                </div>
                            )}

                            <div className="bg-base-200 p-4 rounded-lg">
                                <p className="font-semibold">Reason for Claim:</p>
                                <p className="text-sm text-base-content/80 mt-1">{selectedClaim?.claimDetails}</p>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button onClick={handleApprove} className="btn btn-success" disabled={mutation.isPending}>
                                {mutation.isPending && <span className="loading loading-spinner"></span>}
                                <FaCheck /> Approve Claim
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default PolicyClearance;