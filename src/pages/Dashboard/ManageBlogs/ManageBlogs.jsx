import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../../api/axiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../../context/AuthContext';

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [editingBlog, setEditingBlog] = useState(null);

    // Fetch all blogs
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/blogs');
            setBlogs(response.data);
        } catch (error) {
            toast.error('Could not fetch blog posts.', error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Handle form submission
    const onSubmit = async (data) => {
        // Pre-fill author name from logged-in user
        const blogData = { ...data, authorName: user.displayName };

        try {
            if (editingBlog) {
                await axiosSecure.patch(`/blogs/${editingBlog._id}`, blogData);
                toast.success('Blog post updated successfully!');
            } else {
                await axiosSecure.post('/blogs', blogData);
                toast.success('Blog post added successfully!');
            }
            document.getElementById('blog_modal').close();
            reset();
            setEditingBlog(null);
            fetchBlogs();
        } catch (error) {
            toast.error('An error occurred.', error);
        }
    };

    // Handle deletion
    const handleDelete = (blog) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert deleting "${blog.title}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/blogs/${blog._id}`)
                    .then(() => {
                        Swal.fire('Deleted!', 'The blog post has been deleted.', 'success');
                        fetchBlogs();
                    })
                    .catch(() => toast.error('Could not delete the post.'));
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
    }

    if (loading) return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;

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
                        <button type="submit" className="btn btn-primary w-full">Submit Post</button>
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