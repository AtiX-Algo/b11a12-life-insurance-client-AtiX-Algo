import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const PolicyClearance = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Fetch all pending claims
    const { data: pendingClaims = [], isLoading } = useQuery({
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
        mutation.mutate(selectedClaim._id);
    };
    
    const openDetailsModal = (claim) => {
        setSelectedClaim(claim);
        document.getElementById('details_modal').showModal();
    };

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Policy Clearance</title></Helmet>
            <h1 className="text-3xl font-bold mb-6">Pending Claim Requests ({pendingClaims.length})</h1>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Applicant Name</th>
                            <th>Policy</th>
                            <th>Date Submitted</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingClaims.map((claim, index) => (
                            <tr key={claim._id}>
                                <th>{index + 1}</th>
                                <td>{claim.applicantName}</td>
                                <td>{claim.policyTitle}</td>
                                <td>{new Date(claim.submissionDate).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => openDetailsModal(claim)} className="btn btn-sm btn-primary">
                                        View & Approve
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details & Approval Modal */}
            <dialog id="details_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Claim Details for {selectedClaim?.applicantName}</h3>
                    <p className="py-2"><strong>Policy:</strong> {selectedClaim?.policyTitle}</p>
                    
                    {/* Document Link Section */}
                    {selectedClaim?.documentUrl && (
                        <div className="my-4">
                            <a href={selectedClaim.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                View Submitted Document
                            </a>
                        </div>
                    )}

                    <div className="bg-base-200 p-4 rounded-lg my-4">
                        <p className="font-semibold">Reason for Claim:</p>
                        <p>{selectedClaim?.claimDetails}</p>
                    </div>
                    <div className="modal-action justify-between">
                        <button type="button" onClick={() => document.getElementById('details_modal').close()} className="btn">Close</button>
                        <button onClick={handleApprove} className="btn btn-success" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Approving...' : 'Approve Claim'}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default PolicyClearance;