import React, { useState } from 'react';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

const ManageApplications = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  // Fetch applications
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await axiosSecure.get('/applications');
      return res.data;
    },
  });

  // Fetch agents
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users/agents');
      return res.data;
    },
  });

  // Mutation for status update
  const statusMutation = useMutation({
    mutationFn: ({ id, updateData }) =>
      axiosSecure.patch(`/applications/${id}`, updateData),
    onSuccess: (data, variables) => {
      if (variables.updateData.status === 'Rejected' && variables.updateData.rejectionFeedback) {
        toast.success('Application has been rejected with feedback.');
      } else {
        toast.success(`Application has been ${variables.updateData.status?.toLowerCase() || 'updated'}.`);
      }
      queryClient.invalidateQueries(['applications']);
    },
    onError: () => toast.error('Status update failed.'),
  });

  // Mutation for agent assignment
  const assignMutation = useMutation({
    mutationFn: ({ appId, agent }) =>
      axiosSecure.patch(`/applications/${appId}`, {
        agentId: agent._id,
        agentName: agent.name,
      }),
    onSuccess: (_, { agent }) => {
      toast.success(`Assigned to ${agent.name}`);
      queryClient.invalidateQueries(['applications']);
      document.getElementById('assign_modal').close();
    },
    onError: () => toast.error('Assignment failed.'),
  });

  // Handle approve
  const handleApprove = (id) => {
    statusMutation.mutate({ 
      id, 
      updateData: { status: 'Approved' } 
    });
  };

  // Handle reject with feedback
  const handleRejectSubmit = (data) => {
    if (!selectedApp) return;
    statusMutation.mutate({ 
      id: selectedApp._id, 
      updateData: { 
        status: 'Rejected', 
        rejectionFeedback: data.feedback 
      } 
    });
    document.getElementById('rejection_modal').close();
    reset();
  };

  // Handle assign agent form submit
  const handleAssignAgent = (e) => {
    e.preventDefault();
    const selectedAgent = agents.find((agent) => agent._id === selectedAgentId);
    if (!selectedAgent || !selectedApp) return;
    assignMutation.mutate({ appId: selectedApp._id, agent: selectedAgent });
  };

  // Open assign modal
  const openAssignModal = (app) => {
    setSelectedApp(app);
    setSelectedAgentId('');
    document.getElementById('assign_modal').showModal();
  };

  // Open rejection modal
  const openRejectionModal = (app) => {
    setSelectedApp(app);
    document.getElementById('rejection_modal').showModal();
  };

  if (loadingApps || loadingAgents) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Dashboard | Manage Applications</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Manage Applications ({applications.length})
        </h1>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Applicant Name</th>
              <th>Email</th>
              <th>Policy</th>
              <th>Status</th>
              <th>Assigned Agent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={app._id}>
                <th>{index + 1}</th>
                <td>{app.applicantName}</td>
                <td>{app.applicantEmail}</td>
                <td>{app.policyTitle}</td>
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
                <td>{app.agentName || 'Not Assigned'}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => handleApprove(app._id)}
                    className="btn btn-sm btn-success"
                    disabled={app.status !== 'Pending'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectionModal(app)}
                    className="btn btn-sm btn-error"
                    disabled={app.status !== 'Pending'}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openAssignModal(app)}
                    className="btn btn-sm btn-info"
                    disabled={app.status !== 'Pending'}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Agent Modal */}
      <dialog id="assign_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Assign Agent for {selectedApp?.applicantName}
          </h3>
          <form onSubmit={handleAssignAgent}>
            <div className="form-control w-full my-6">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="" disabled>
                  Select an agent
                </option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={assignMutation.isLoading}
            >
              {assignMutation.isLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </form>
          <div className="modal-action">
            <button
              onClick={() => document.getElementById('assign_modal').close()}
              className="btn"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      {/* Rejection Modal */}
      <dialog id="rejection_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Reason for Rejection</h3>
          <p className="py-2">Please provide feedback for {selectedApp?.applicantName}.</p>
          <form onSubmit={handleSubmit(handleRejectSubmit)}>
            <textarea 
              {...register("feedback", { required: true })} 
              className="textarea textarea-bordered w-full h-24" 
              placeholder="e.g., Missing documentation, incomplete information, etc..."
              required
            ></textarea>
            <div className="modal-action justify-between">
              <button 
                type="button" 
                onClick={() => document.getElementById('rejection_modal').close()} 
                className="btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-error"
                disabled={statusMutation.isLoading}
              >
                {statusMutation.isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default ManageApplications;