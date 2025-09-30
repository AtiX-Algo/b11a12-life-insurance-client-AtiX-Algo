import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LatestBlogs = () => {
    const { data: blogs = [], isLoading } = useQuery({
        queryKey: ['latestBlogs'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:5000/blogs/latest');
            return res.data;
        }
    });

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="my-16 container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-10">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {blogs.map(blog => (
                    <div key={blog._id} className="card bg-base-100 shadow-xl">
                        <figure><img src={blog.image} alt={blog.title} className="h-48 w-full object-cover" /></figure>
                        <div className="card-body">
                            <h2 className="card-title">{blog.title}</h2>
                            <p>{blog.content.substring(0, 80)}...</p>
                            <div className="card-actions justify-end">
                                <Link to={`/blog/${blog._id}`} className="btn btn-primary">Read More</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-10">
                <Link to="/blog" className="btn btn-secondary">View All Articles</Link>
            </div>
        </div>
    );
};

export default LatestBlogs;