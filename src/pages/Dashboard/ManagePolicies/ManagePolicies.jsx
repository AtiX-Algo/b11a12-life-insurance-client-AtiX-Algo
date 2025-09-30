import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';

const ManagePolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, reset, setValue } = useForm();
    const [editingPolicy, setEditingPolicy] = useState(null);

    // Fetch all policies
    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/policies?limit=100'); // Get all policies for admin
            setPolicies(response.data.policies);
        } catch (error) {
            toast.error('Could not fetch policies.', error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    // Handle form submission for both create and update
    const onSubmit = async (data) => {
        const policyData = { ...data };

        try {
            if (editingPolicy) {
                // Update existing policy
                await axiosSecure.patch(`/policies/${editingPolicy._id}`, policyData);
                toast.success('Policy updated successfully!');
            } else {
                // Create new policy
                await axiosSecure.post('/policies', policyData);
                toast.success('Policy added successfully!');
            }
            document.getElementById('policy_modal').close();
            reset();
            setEditingPolicy(null);
            fetchPolicies(); // Refetch policies to update the list
        } catch (error) {
            toast.error('An error occurred.', error);
        }
    };

    // Handle policy deletion
    const handleDelete = (policy) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert deleting "${policy.title}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/policies/${policy._id}`)
                    .then(() => {
                        Swal.fire('Deleted!', 'The policy has been deleted.', 'success');
                        fetchPolicies(); // Refetch policies
                    })
                    .catch(() => toast.error('Could not delete policy.'));
            }
        });
    };

    // Open modal for editing
    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        // Pre-fill form fields
        setValue('title', policy.title);
        setValue('category', policy.category);
        setValue('details', policy.details);
        setValue('image', policy.image);
        setValue('coverage', policy.coverage);
        setValue('term', policy.term);
        document.getElementById('policy_modal').showModal();
    };
    
    // Open modal for adding
    const openAddModal = () => {
        setEditingPolicy(null);
        reset();
        document.getElementById('policy_modal').showModal();
    }

    if (loading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Manage Policies</title></Helmet>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Policies ({policies.length})</h1>
                <button onClick={openAddModal} className="btn btn-primary">Add New Policy</button>
            </div>

            {/* Policies Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Coverage</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map((policy, index) => (
                            <tr key={policy._id}>
                                <th>{index + 1}</th>
                                <td>{policy.title}</td>
                                <td>{policy.category}</td>
                                <td>{policy.coverage}</td>
                                <td className='space-x-2'>
                                    <button onClick={() => handleEdit(policy)} className="btn btn-sm btn-info">Edit</button>
                                    <button onClick={() => handleDelete(policy)} className="btn btn-sm btn-error">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <dialog id="policy_modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg">{editingPolicy ? 'Edit Policy' : 'Add a New Policy'}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <input {...register("title", { required: true })} placeholder="Policy Title" className="input input-bordered w-full" />
                        <input {...register("category", { required: true })} placeholder="Category (e.g., Term Life)" className="input input-bordered w-full" />
                        <textarea {...register("details", { required: true })} placeholder="Details" className="textarea textarea-bordered w-full"></textarea>
                        <input {...register("image", { required: true })} placeholder="Image URL" className="input input-bordered w-full" />
                        <input {...register("coverage", { required: true })} placeholder="Coverage Amount" className="input input-bordered w-full" />
                        <input {...register("term", { required: true })} placeholder="Term Duration" className="input input-bordered w-full" />
                        <button type="submit" className="btn btn-primary w-full">Submit</button>
                    </form>
                    <div className="modal-action">
                        <button onClick={() => document.getElementById('policy_modal').close()} className="btn">Close</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ManagePolicies;