import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ManagePolicies = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Fetch all policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies-admin'],
    queryFn: async () => {
      const res = await axiosSecure.get('/policies?limit=100');
      return res.data.policies;
    },
  });

  // Mutation for create/update
  const savePolicyMutation = useMutation({
    mutationFn: async ({ data, id }) => {
      if (id) {
        // Update existing policy
        return axiosSecure.patch(`/policies/${id}`, data);
      } else {
        // Create new policy
        return axiosSecure.post('/policies', data);
      }
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Policy updated successfully!' : 'Policy added successfully!');
      queryClient.invalidateQueries(['policies-admin']);
      document.getElementById('policy_modal').close();
      reset();
      setEditingPolicy(null);
    },
    onError: () => toast.error('An error occurred.'),
  });

  // Mutation for delete
  const deletePolicyMutation = useMutation({
    mutationFn: async (policyId) => axiosSecure.delete(`/policies/${policyId}`),
    onSuccess: () => {
      Swal.fire('Deleted!', 'The policy has been deleted.', 'success');
      queryClient.invalidateQueries(['policies-admin']);
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
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deletePolicyMutation.mutate(policy._id);
      }
    });
  };

  // Handle edit
  const handleEdit = (policy) => {
    setEditingPolicy(policy);
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
  };

  if (isLoading)
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>Dashboard | Manage Policies</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Policies ({policies.length})</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          Add New Policy
        </button>
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
                <td className="space-x-2">
                  <button
                    onClick={() => handleEdit(policy)}
                    className="btn btn-sm btn-info"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(policy)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <dialog id="policy_modal" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg">
            {editingPolicy ? 'Edit Policy' : 'Add a New Policy'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <input
              {...register('title', { required: true })}
              placeholder="Policy Title"
              className="input input-bordered w-full"
            />
            <input
              {...register('category', { required: true })}
              placeholder="Category (e.g., Term Life)"
              className="input input-bordered w-full"
            />
            <textarea
              {...register('details', { required: true })}
              placeholder="Details"
              className="textarea textarea-bordered w-full"
            ></textarea>
            <input
              {...register('image', { required: true })}
              placeholder="Image URL"
              className="input input-bordered w-full"
            />
            <input
              {...register('coverage', { required: true })}
              placeholder="Coverage Amount"
              className="input input-bordered w-full"
            />
            <input
              {...register('term', { required: true })}
              placeholder="Term Duration"
              className="input input-bordered w-full"
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={savePolicyMutation.isLoading}
            >
              {savePolicyMutation.isLoading
                ? 'Saving...'
                : editingPolicy
                ? 'Update'
                : 'Create'}
            </button>
          </form>
          <div className="modal-action">
            <button
              onClick={() => document.getElementById('policy_modal').close()}
              className="btn"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ManagePolicies;
