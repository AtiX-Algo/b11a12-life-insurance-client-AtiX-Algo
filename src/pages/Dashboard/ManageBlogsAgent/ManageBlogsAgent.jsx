// client/src/pages/Dashboard/ManageBlogsAgent/ManageBlogsAgent.jsx

import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageBlogsAgent = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue } = useForm();
    const [editingBlog, setEditingBlog] = useState(null);

    const { data: blogs = [], isLoading } = useQuery({
        queryKey: ['agentBlogs', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/blogs/agent/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const { mutate: addBlog } = useMutation({
        mutationFn: (newBlog) => axiosSecure.post('/blogs', newBlog),
        onSuccess: () => {
            toast.success('Blog post added!');
            // use TanStack Query v5 object syntax and include the same key used by useQuery
            queryClient.invalidateQueries({ queryKey: ['agentBlogs', user?.email] });
        }
    });

    const { mutate: updateBlog } = useMutation({
        mutationFn: ({ id, updatedData }) => axiosSecure.patch(`/blogs/agent/${id}`, updatedData),
        onSuccess: () => {
            toast.success('Blog post updated!');
            queryClient.invalidateQueries({ queryKey: ['agentBlogs', user?.email] });
        }
    });

    const { mutate: deleteBlog } = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/blogs/agent/${id}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The blog post has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['agentBlogs', user?.email] });
        }
    });

    const onSubmit = (data) => {
        if (editingBlog) {
            updateBlog({ id: editingBlog._id, updatedData: data });
        } else {
            addBlog(data);
        }
        // close modal and reset form
        const modal = document.getElementById('blog_modal_agent');
        if (modal) modal.close();
        reset();
    };

    const handleDelete = (blog) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteBlog(blog._id);
            }
        });
    };

    const openEditModal = (blog) => {
        setEditingBlog(blog);
        setValue('title', blog.title);
        setValue('image', blog.image);
        setValue('content', blog.content);
        const modal = document.getElementById('blog_modal_agent');
        if (modal) modal.showModal();
    };

    const openAddModal = () => {
        setEditingBlog(null);
        reset();
        const modal = document.getElementById('blog_modal_agent');
        if (modal) modal.showModal();
    };

    if (isLoading) return (
        <div className="text-center my-10">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    return (
        <div>
            <Helmet><title>Dashboard | Manage My Blogs</title></Helmet>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage My Blogs ({blogs.length})</h1>
                <button onClick={openAddModal} className="btn btn-primary">Add New Post</button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th className="max-w-xs">Content</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog, index) => (
                            <tr key={blog._id}>
                                <td>{index + 1}</td>
                                <td>
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                </td>
                                <td>{blog.title}</td>
                                <td className="max-w-xs truncate">{blog.content}</td>
                                <td className="space-x-2">
                                    <button onClick={() => openEditModal(blog)} className="btn btn-sm btn-info">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(blog)} className="btn btn-sm btn-error">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Blog Modal */}
            <dialog id="blog_modal_agent" className="modal">
                <div className="modal-box">
                    {/* IMPORTANT: method="dialog" removed so react-hook-form's onSubmit fires */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <h3 className="font-bold text-lg mb-4">
                            {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                        </h3>

                        <div className="form-control mb-3">
                            <label className="label"><span className="label-text">Title</span></label>
                            <input
                                type="text"
                                {...register('title', { required: true })}
                                className="input input-bordered"
                            />
                        </div>

                        <div className="form-control mb-3">
                            <label className="label"><span className="label-text">Image URL</span></label>
                            <input
                                type="text"
                                {...register('image', { required: true })}
                                className="input input-bordered"
                            />
                        </div>

                        <div className="form-control mb-3">
                            <label className="label"><span className="label-text">Content</span></label>
                            <textarea
                                {...register('content', { required: true })}
                                className="textarea textarea-bordered h-24"
                            ></textarea>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => document.getElementById('blog_modal_agent')?.close()}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingBlog ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ManageBlogsAgent;
