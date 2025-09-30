import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agents from the server
    axios.get('http://localhost:5000/agents')
      .then(response => {
        setAgents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the agents!", error);
        setLoading(false);
      });
  }, []); // Empty array ensures this runs only once on component mount

  if (loading) {
    return <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-4xl font-bold text-center mb-8">Meet Our Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent._id} className="card bg-base-100 shadow-xl">
            <figure><img src={agent.photoUrl} alt={`Photo of ${agent.name}`} className="h-60 w-full object-cover" /></figure>
            <div className="card-body">
              <h2 className="card-title">{agent.name}</h2>
              <p><strong>Experience:</strong> {agent.experience}</p>
              <div className="card-actions justify-start">
                {agent.specialties.map(specialty => (
                  <div key={specialty} className="badge badge-outline">{specialty}</div>
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