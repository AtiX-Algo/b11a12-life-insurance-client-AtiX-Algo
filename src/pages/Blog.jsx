import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';  


const Blog = () => {
  // Fetch blogs with TanStack Query
  const { data: blogs = [], isLoading, isError } = useQuery({
	queryKey: ['blogs'],
	queryFn: async () => {
	  const res = await axios.get('http://localhost:5000/blogs');
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
	return (
	  <p className="text-center text-red-500">Failed to load blogs. Please try again later.</p>
	);
  }

  return (
	<>
	  <Helmet>
		<title>Aegis Life | Blog</title>
	  </Helmet>
	  <div className="container mx-auto px-4 py-8">
		<h1 className="text-4xl font-bold text-center mb-8">From Our Blog</h1>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		  {blogs.map((blog) => (
			<div key={blog._id} className="card bg-base-100 shadow-xl">
			  <figure>
				<img
				  src={blog.image}
				  alt={blog.title}
				  className="h-56 w-full object-cover"
				/>
			  </figure>
			  <div className="card-body">
				<h2 className="card-title">{blog.title}</h2>
				<div className="flex justify-between text-sm text-gray-500">
				  <span>By {blog.authorName}</span>
				  <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
				</div>
				<p>{blog.content.substring(0, 120)}...</p>
				<div className="card-actions justify-end">
				  <button className=""><Link to={`/blog/${blog._id}`} className="btn btn-outline btn-primary">
                    Read More
                  </Link></button>
				</div>
			  </div>
			</div>
		  ))}
		</div>
	  </div>
	</>
  );
};



export default Blog;