import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const BlogDetails = () => {
	const { id } = useParams();

	// Mutation to increment the visit count
	const { mutate: incrementVisit } = useMutation({
		mutationFn: () => axios.patch(`http://localhost:5000/blogs/visit/${id}`)
	});

	// Fetch blog details
	const { data: blog, isLoading } = useQuery({
		queryKey: ['blog', id],
		queryFn: async () => {
			const res = await axios.get(`http://localhost:5000/blogs/${id}`);
			return res.data;
		}
	});
	
	// Increment visit count once when the component mounts
	useEffect(() => {
		incrementVisit();
	}, [incrementVisit]);

	if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

	return (
		<>
			<Helmet><title>{`Aegis Life | ${blog?.title}`}</title></Helmet>
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<img src={blog.image} alt={blog.title} className="w-full h-96 object-cover rounded-lg mb-6" />
				<h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
				<div className="flex justify-between text-sm text-gray-500 mb-6">
					<span>By <strong>{blog.authorName}</strong></span>
					<span>Published on {new Date(blog.publishDate).toLocaleDateString()}</span>
				</div>
				<div className="prose lg:prose-xl max-w-none">
					<p>{blog.content}</p>
				</div>
			</div>
		</>
	);
};

export default BlogDetails;