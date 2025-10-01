import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaTrashAlt, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton component for a better loading experience
const BlogListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow">
                <div className="skeleton h-16 w-24 flex-shrink-0 rounded-md"></div>
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                </div>
                <div className="skeleton h-8 w-20"></div>
            </div>
        ))}
    </div>
);

const ManageBlogs = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [editingBlog, setEditingBlog] = useState(null);

    // Fetch blogs
    const { data: blogs = [], isLoading, isError } = useQuery({
        queryKey: ['blogs-admin'], // Use a unique key for admin view
        queryFn: async () => {
            const response = await axiosSecure.get('/blogs');
            return response.data;
        },
    });

    // Mutation for adding/updating a blog
    const blogMutation = useMutation({
        mutationFn: async (blogData) => {
            if (editingBlog) {
                return axiosSecure.patch(`/blogs/${editingBlog._id}`, blogData);
            } else {
                return axiosSecure.post('/blogs', blogData);
            }
        },
        onSuccess: () => {
            toast.success(editingBlog ? 'Blog post updated!' : 'Blog post added!');
            document.getElementById('blog_modal').close();
            queryClient.invalidateQueries({ queryKey: ['blogs-admin'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'An error occurred.'),
    });

    // Mutation for deleting a blog
    const deleteMutation = useMutation({
        mutationFn: (blogId) => axiosSecure.delete(`/blogs/${blogId}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The blog post has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['blogs-admin'] });
        },
        onError: () => toast.error('Could not delete the post.'),
    });

    // Handle form submission for add/edit
    const onSubmit = (data) => {
        blogMutation.mutate(data);
    };

    // Handle deletion with confirmation
    const handleDelete = (blog) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert deleting "${blog.title}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(blog._id);
            }
        });
    };

    // Open modal for editing
    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setValue('title', blog.title);
        setValue('image', blog.image);
        setValue('content', blog.content);
        document.getElementById('blog_modal').showModal();
    };
    
    // Open modal for adding
    const openAddModal = () => {
        setEditingBlog(null);
        reset();
        document.getElementById('blog_modal').showModal();
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <Helmet><title>Dashboard | Manage Blogs</title></Helmet>
            <div className="card-body">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
                        <p className="text-base-content/70">You have {blogs.length} posts.</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <FaPlus /> Add New Post
                    </button>
                </div>

                {/* Blogs List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <BlogListSkeleton />
                    ) : isError ? (
                        <div className="text-center py-16">
                            <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold">Failed to Load Blog Posts</h3>
                        </div>
                    ) : blogs.length === 0 ? (
                         <div className="text-center py-16">
                            <h3 className="text-2xl font-semibold">No Blog Posts Found</h3>
                            <p className="text-base-content/70 mt-2">Click "Add New Post" to get started.</p>
                        </div>
                    ) : (
                        blogs.map((blog) => (
                            <div key={blog._id} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                                <img src={blog.image} alt={blog.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-bold">{blog.title}</h3>
                                    <p className="text-sm text-base-content/60">
                                        By {blog.authorName} on {new Date(blog.publishDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <button onClick={() => handleEdit(blog)} className="btn btn-sm btn-outline btn-info"><FaEdit /></button>
                                    <button onClick={() => handleDelete(blog)} className="btn btn-sm btn-outline btn-error"><FaTrashAlt /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add/Edit Modal */}
                <dialog id="blog_modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{editingBlog ? 'Edit Post' : 'Add a New Post'}</h3>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setEditingBlog(null)}>✕</button>
                        </form>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Post Title</span></label>
                                <input {...register("title", { required: "Title is required" })} placeholder="Title" className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`} />
                                {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Image URL</span></label>
                                <input {...register("image", { required: "Image URL is required" })} placeholder="https://example.com/image.jpg" className={`input input-bordered w-full ${errors.image ? 'input-error' : ''}`} />
                                {errors.image && <span className="text-error text-sm mt-1">{errors.image.message}</span>}
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Content</span></label>
                                <textarea {...register("content", { required: "Content is required" })} placeholder="Write your blog content here..." className={`textarea textarea-bordered w-full h-40 ${errors.content ? 'textarea-error' : ''}`}></textarea>
                                {errors.content && <span className="text-error text-sm mt-1">{errors.content.message}</span>}
                            </div>
                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary w-full" disabled={blogMutation.isPending}>
                                    {blogMutation.isPending && <span className="loading loading-spinner"></span>}
                                    {editingBlog ? 'Update Post' : 'Submit Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default ManageBlogs;