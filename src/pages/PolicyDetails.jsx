import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const PolicyDetails = () => {
  const { id } = useParams();

  // Fetch policy details with TanStack Query
  const {
    data: policy,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['policy', id], // unique cache key
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/policies/${id}`);
      return res.data;
    },
    enabled: !!id, // only fetch if id exists
  });

  if (isLoading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError || !policy) {
    return (
      <div className="text-center my-10 text-2xl">
        Policy not found.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Aegis Life | ${policy.title}`}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="card lg:card-side bg-base-100 shadow-xl">
          <figure className="lg:w-1/3">
            <img
              src={policy.image}
              alt={policy.title}
              className="w-full h-full object-cover"
            />
          </figure>
          <div className="card-body lg:w-2/3">
            <h1 className="card-title text-4xl font-bold">{policy.title}</h1>
            <p className="badge badge-secondary my-2">{policy.category}</p>
            <p className="mt-4">{policy.details}</p>

            <div className="stats shadow mt-6">
              <div className="stat">
                <div className="stat-title">Max Coverage</div>
                <div className="stat-value text-primary">{policy.coverage}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Term Length</div>
                <div className="stat-value text-secondary">{policy.term}</div>
              </div>
            </div>

            <div className="card-actions justify-end mt-8">
              <Link to={`/quote/${policy._id}`} className="btn btn-primary btn-lg">Get a Quote</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolicyDetails;
