import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const Agents = () => {
  // Fetch agents from the new PUBLIC endpoint
  const { data: agents = [], isLoading, isError } = useQuery({
    queryKey: ['publicAgents'], // Use a new query key
    queryFn: async () => {
      // Corrected API endpoint
      const response = await axios.get('https://aegis-life-server.onrender.com/agents/public');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError || agents.length === 0) {
    // Hide the section if there's an error or no agents to show
    return null; 
  }

  return (
    <div className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-10">Meet Our Expert Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                <div key={agent._id} className="card bg-base-100 shadow-xl text-center">
                    <figure className="px-10 pt-10">
                    <img 
                        src={agent.photoURL}
                        alt={`Photo of ${agent.name}`} 
                        className="rounded-full w-32 h-32 object-cover ring ring-primary ring-offset-base-100 ring-offset-2" 
                    />
                    </figure>
                    <div className="card-body items-center">
                    <h2 className="card-title">{agent.name}</h2>
                    <p><strong>Experience:</strong> {agent.experience || 'N/A'}</p>
                    <div className="card-actions justify-center flex flex-wrap gap-1 mt-2">
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
    </div>
  );
};

export default Agents;