import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const Agents = () => {
  // Fetch agents from the public endpoint
  const { data: agents = [], isLoading, isError } = useQuery({
    queryKey: ['publicAgents'],
    queryFn: async () => {
      const response = await axios.get('https://aegis-life-server.onrender.com/agents/public');
      return response.data;
    }
  });

  // Conditionally render the section based on loading, error, or empty data
  if (isLoading) {
    return (
      <div className="py-20 md:py-28 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (isError || agents.length === 0) {
    // Hide the section completely if there's an error or no agents
    return null;
  }

  return (
    <div className="bg-base-200 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Meet Our Expert Agents</h2>
          <p className="text-lg text-base-content/70 mt-2 max-w-2xl mx-auto">
            Connect with our dedicated professionals who are committed to finding the perfect policy for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map(agent => (
            <div key={agent._id} className="card bg-base-100 shadow-lg text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <figure className="px-10 pt-10">
                <img
                  src={agent.photoURL}
                  alt={`Photo of ${agent.name}`}
                  className="rounded-full w-32 h-32 object-cover ring ring-primary ring-offset-base-100 ring-offset-2"
                />
              </figure>
              <div className="card-body items-center flex flex-col">
                <div className="flex-grow">
                  <h2 className="card-title text-2xl font-bold justify-center">{agent.name}</h2>
                  <p className="mt-1 text-base-content/70">
                    <strong>{agent.experience || 'N/A'}</strong> of Experience
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center my-4">
                    {agent.specialties?.map(specialty => (
                      <div key={specialty} className="badge badge-outline">
                        {specialty}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-actions w-full mt-4">
                  <button className="btn btn-primary btn-outline w-full">Contact Agent</button>
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