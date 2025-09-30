import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PopularPolicies = () => {
  // Fetch popular policies with TanStack Query
  const { data: policies = [], isLoading, isError } = useQuery({
    queryKey: ['popular-policies'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/policies/popular');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-red-500">Failed to load popular policies.</p>;
  }

  return (
    <div className="my-16 container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-10">Popular Policies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div key={policy._id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={policy.image}
                alt={policy.title}
                className="h-56 w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{policy.title}</h2>
              <p>
                Coverage: <strong>{policy.coverage}</strong>
              </p>
              <p>
                Term: <strong>{policy.term}</strong>
              </p>
              <div className="card-actions justify-end">
                <Link to={`/policy/${policy._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPolicies;
