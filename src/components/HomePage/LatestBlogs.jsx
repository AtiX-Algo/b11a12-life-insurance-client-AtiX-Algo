import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LatestBlogs = () => {
  const { data: blogs = [], isLoading, isError } = useQuery({
    queryKey: ['latestBlogs'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/blogs/latest');
      return res.data;
    },
  });

  return (
    <div className="bg-base-200 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">From Our Blog</h2>
          <p className="text-lg text-base-content/70 mt-2 max-w-2xl mx-auto">
            Stay informed with our latest articles, insights, and advice on financial planning and security.
          </p>
        </div>

        {isLoading && (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        
        {isError && <p className="text-center text-error">Failed to load blog posts.</p>}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogs.map((blog) => (
                <div key={blog._id} className="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <figure className="h-48">
                    <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title font-bold leading-snug">{blog.title}</h2>
                    <p className="text-base-content/80 mt-2">{blog.content.substring(0, 80)}...</p>
                    <div className="card-actions justify-end mt-4">
                      <Link to={`/blog/${blog._id}`} className="btn btn-primary btn-outline">Read More</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/blog" className="btn btn-secondary btn-lg">View All Articles</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LatestBlogs;