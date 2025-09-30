import React, { useContext } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AssignedCustomers = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // Fetch assigned applications for the logged-in agent
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['assigned-applications', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/applications/agent/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email, // Only fetch if user email is available
  });

  // Mutation for status updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) =>
      axiosSecure.patch(`/applications/${id}`, { status: newStatus }),
    onSuccess: (_, { newStatus }) => {
      toast.success(`Application marked as ${newStatus}`);
      queryClient.invalidateQueries(['assigned-applications', user?.email]);
    },
    onError: () => toast.error('Status update failed.'),
  });

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  if (isLoading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">My Assigned Customers</h1>
      <div className="overflow-x-auto mt-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Applicant Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.applicantName}</td>
                <td>
                  <span
                    className={`badge ${
                      app.status === 'Approved'
                        ? 'badge-success'
                        : app.status === 'Rejected'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(app._id, 'Approved')}
                    className="btn btn-sm btn-success"
                    disabled={app.status !== 'Pending'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                    className="btn btn-sm btn-error"
                    disabled={app.status !== 'Pending'}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedCustomers;
