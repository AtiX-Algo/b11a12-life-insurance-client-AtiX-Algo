import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaTrashAlt, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const PolicyListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow">
                <div className="skeleton h-16 w-24 flex-shrink-0 rounded-md"></div>
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-8 w-20"></div>
            </div>
        ))}
    </div>
);


const ManagePolicies = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [editingPolicy, setEditingPolicy] = useState(null);

    // Fetch all policies
    const { data: policies = [], isLoading, isError } = useQuery({
        queryKey: ['policies-admin'],
        queryFn: async () => {
            const res = await axiosSecure.get('/policies?limit=100'); // Fetch all for management
            return res.data.policies;
        },
    });

    // Mutation for create/update
    const savePolicyMutation = useMutation({
        mutationFn: async ({ data, id }) => {
            if (id) {
                return axiosSecure.patch(`/policies/${id}`, data);
            } else {
                return axiosSecure.post('/policies', data);
            }
        },
        onSuccess: (_, { id }) => {
            toast.success(id ? 'Policy updated successfully!' : 'Policy added successfully!');
            queryClient.invalidateQueries({ queryKey: ['policies-admin'] });
            document.getElementById('policy_modal').close();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'An error occurred.'),
    });

    // Mutation for delete
    const deletePolicyMutation = useMutation({
        mutationFn: (policyId) => axiosSecure.delete(`/policies/${policyId}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The policy has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['policies-admin'] });
        },
        onError: () => toast.error('Could not delete policy.'),
    });

    // Handle form submission
    const onSubmit = (data) => {
        savePolicyMutation.mutate({ data, id: editingPolicy?._id });
    };

    // Handle delete confirmation
    const handleDelete = (policy) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert deleting "${policy.title}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deletePolicyMutation.mutate(policy._id);
            }
        });
    };

    // Handle edit
    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        Object.keys(policy).forEach(key => setValue(key, policy[key]));
        document.getElementById('policy_modal').showModal();
    };

    // Open modal for adding
    const openAddModal = () => {
        setEditingPolicy(null);
        reset();
        document.getElementById('policy_modal').showModal();
    };
    
    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Manage Policies</title></Helmet>
            <div className="card-body">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Insurance Policies</h1>
                        <p className="text-base-content/70">A total of {policies.length} policies found.</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <FaPlus /> Add New Policy
                    </button>
                </div>

                {/* Policies List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <PolicyListSkeleton />
                    ) : isError ? (
                        <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Policies</h3>
                        </div>
                    ) : policies.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl font-semibold">No Policies Found</h3>
                            <p className="text-base-content/70 mt-2">Click "Add New Policy" to create one.</p>
                        </div>
                    ) : (
                        policies.map((policy) => (
                            <div key={policy._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg items-center">
                                <div className="flex items-center gap-4 md:col-span-2">
                                    <img src={policy.image} alt={policy.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0 hidden sm:block" />
                                    <div>
                                        <h3 className="font-bold">{policy.title}</h3>
                                        <div className="badge badge-ghost badge-sm">{policy.category}</div>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Coverage: </span>{policy.coverage}
                                </div>
                                <div className='flex items-center justify-end gap-2'>
                                    <button onClick={() => handleEdit(policy)} className="btn btn-sm btn-outline btn-info"><FaEdit /> Edit</button>
                                    <button onClick={() => handleDelete(policy)} className="btn btn-sm btn-outline btn-error"><FaTrashAlt /> Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add/Edit Modal */}
                <dialog id="policy_modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{editingPolicy ? 'Edit Policy' : 'Add a New Policy'}</h3>
                         <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setEditingPolicy(null)}>✕</button>
                        </form>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Policy Title</span></label>
                                <input {...register("title", { required: "Title is required" })} placeholder="Title" className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`} />
                                {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Category</span></label>
                                    <input {...register("category", { required: "Category is required" })} placeholder="e.g., Term Life" className={`input input-bordered w-full ${errors.category ? 'input-error' : ''}`} />
                                     {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Image URL</span></label>
                                    <input {...register("image", { required: "Image URL is required" })} placeholder="https://..." className={`input input-bordered w-full ${errors.image ? 'input-error' : ''}`} />
                                     {errors.image && <span className="text-error text-sm mt-1">{errors.image.message}</span>}
                                </div>
                                 <div className="form-control">
                                    <label className="label"><span className="label-text">Coverage Amount</span></label>
                                    <input {...register("coverage", { required: "Coverage is required" })} placeholder="e.g., $500,000" className={`input input-bordered w-full ${errors.coverage ? 'input-error' : ''}`} />
                                     {errors.coverage && <span className="text-error text-sm mt-1">{errors.coverage.message}</span>}
                                </div>
                                 <div className="form-control">
                                    <label className="label"><span className="label-text">Term Duration</span></label>
                                    <input {...register("term", { required: "Term is required" })} placeholder="e.g., 20 Years" className={`input input-bordered w-full ${errors.term ? 'input-error' : ''}`} />
                                     {errors.term && <span className="text-error text-sm mt-1">{errors.term.message}</span>}
                                </div>
                            </div>
                            
                            <div className="form-control">
                                <label className="label"><span className="label-text">Policy Details</span></label>
                                <textarea {...register("details", { required: "Details are required" })} placeholder="Describe the policy..." className={`textarea textarea-bordered w-full h-24 ${errors.details ? 'textarea-error' : ''}`}></textarea>
                                {errors.details && <span className="text-error text-sm mt-1">{errors.details.message}</span>}
                            </div>
                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary w-full" disabled={savePolicyMutation.isPending}>
                                    {savePolicyMutation.isPending && <span className="loading loading-spinner"></span>}
                                    {editingPolicy ? 'Update Policy' : 'Create Policy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default ManagePolicies;