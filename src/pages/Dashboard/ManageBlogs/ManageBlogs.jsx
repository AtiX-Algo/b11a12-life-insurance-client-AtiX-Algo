import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../../context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';

const ManageBlogs = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [editingBlog, setEditingBlog] = useState(null);

    // Fetch blogs with React Query
    const { data: blogs = [], isLoading, refetch } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            const response = await axiosSecure.get('/blogs');
            return response.data;
        },
    });

    // Mutation for add/update blog
    const blogMutation = useMutation({
        mutationFn: async (blogData) => {
            if (editingBlog) {
                return axiosSecure.patch(`/blogs/${editingBlog._id}`, blogData);
            } else {
                return axiosSecure.post('/blogs', blogData);
            }
        },
        onSuccess: () => {
            toast.success(editingBlog ? 'Blog post updated successfully!' : 'Blog post added successfully!');
            document.getElementById('blog_modal').close();
            reset();
            setEditingBlog(null);
            refetch();
        },
        onError: () => toast.error('An error occurred while saving blog.'),
    });

    // Handle form submission
    const onSubmit = (data) => {
        const blogData = { ...data, authorName: user.displayName };
        blogMutation.mutate(blogData);
    };

    // Mutation for delete
    const deleteMutation = useMutation({
        mutationFn: async (blogId) => {
            return axiosSecure.delete(`/blogs/${blogId}`);
        },
        onSuccess: () => {
            Swal.fire('Deleted!', 'The blog post has been deleted.', 'success');
            refetch();
        },
        onError: () => toast.error('Could not delete the post.'),
    });

    // Handle deletion with confirmation
    const handleDelete = (blog) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert deleting "${blog.title}"!`,
            icon: 'warning',
            showCancelButton: true,
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

    if (isLoading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <Helmet><title>Dashboard | Manage Blogs</title></Helmet>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Blogs ({blogs.length})</h1>
                <button onClick={openAddModal} className="btn btn-primary">Add New Post</button>
            </div>

            {/* Blogs Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog, index) => (
                            <tr key={blog._id}>
                                <th>{index + 1}</th>
                                <td>{blog.title}</td>
                                <td>{blog.authorName}</td>
                                <td>{new Date(blog.publishDate).toLocaleDateString()}</td>
                                <td className='space-x-2'>
                                    <button onClick={() => handleEdit(blog)} className="btn btn-sm btn-info">Edit</button>
                                    <button onClick={() => handleDelete(blog)} className="btn btn-sm btn-error">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <dialog id="blog_modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg">{editingBlog ? 'Edit Post' : 'Add a New Post'}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <input {...register("title", { required: true })} placeholder="Post Title" className="input input-bordered w-full" />
                        <input {...register("image", { required: true })} placeholder="Image URL" className="input input-bordered w-full" />
                        <textarea {...register("content", { required: true })} placeholder="Blog content..." className="textarea textarea-bordered w-full h-40"></textarea>
                        <button type="submit" className="btn btn-primary w-full">
                            {editingBlog ? 'Update Post' : 'Submit Post'}
                        </button>
                    </form>
                    <div className="modal-action">
                        <button onClick={() => document.getElementById('blog_modal').close()} className="btn">Close</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ManageBlogs;
