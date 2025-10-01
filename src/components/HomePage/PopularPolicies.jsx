import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PopularPolicies = () => {
  const { data: policies = [], isLoading, isError } = useQuery({
    queryKey: ['popular-policies'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/policies/popular');
      return res.data;
    },
  });

  return (
    <div className="bg-base-200 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Most Popular Policies</h2>
          <p className="text-lg text-base-content/70 mt-2 max-w-2xl mx-auto">
            Discover the trusted choices that provide security and peace of mind for families like yours.
          </p>
        </div>

        {isLoading && (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {isError && <p className="text-center text-error">Failed to load popular policies.</p>}
        
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policies.map((policy) => (
              <div key={policy._id} className="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <figure className="h-56">
                  <img src={policy.image} alt={policy.title} className="h-full w-full object-cover" />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-2xl font-semibold">{policy.title}</h2>
                  <div className="space-y-2 my-4 text-base">
                    <p>
                      <span className="font-medium text-base-content/70">Coverage: </span> 
                      <strong>{policy.coverage}</strong>
                    </p>
                    <p>
                      <span className="font-medium text-base-content/70">Term: </span> 
                      <strong>{policy.term}</strong>
                    </p>
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <Link to={`/policy/${policy._id}`} className="btn btn-primary w-full md:w-auto">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularPolicies;