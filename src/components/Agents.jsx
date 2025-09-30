import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const Agents = () => {
  // Fetch agents with React Query
  const { data: agents = [], isLoading, isError } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/agents');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 my-10">Failed to load agents.</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-4xl font-bold text-center mb-8">Meet Our Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent._id} className="card bg-base-100 shadow-xl">
            <figure>
              <img 
                src={agent.photoUrl} 
                alt={`Photo of ${agent.name}`} 
                className="h-60 w-full object-cover" 
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{agent.name}</h2>
              <p><strong>Experience:</strong> {agent.experience}</p>
              <div className="card-actions justify-start flex flex-wrap gap-1">
                {agent.specialties?.map(specialty => (
                  <div key={specialty} className="badge badge-outline">
                    {specialty}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agents;
