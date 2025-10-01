import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaUserCircle, FaCalendarAlt, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton Component for a better loading experience
const BlogDetailsSkeleton = () => (
    <div>
        <div className="bg-base-200 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="skeleton h-5 w-64"></div>
            </div>
        </div>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="skeleton h-12 w-full mb-4"></div>
                    <div className="skeleton h-8 w-3/4 mb-6"></div>
                    <div className="skeleton h-96 w-full rounded-lg mb-6"></div>
                    <div className="skeleton h-4 w-full mb-3"></div>
                    <div className="skeleton h-4 w-full mb-3"></div>
                    <div className="skeleton h-4 w-5/6 mb-3"></div>
                </div>
                <div className="lg:col-span-1">
                    <div className="skeleton h-48 w-full"></div>
                </div>
            </div>
        </div>
    </div>
);


const BlogDetails = () => {
    const { id } = useParams();

    // --- FIX: Using the live server URL ---
    const serverUrl = 'https://aegis-life-server.onrender.com';

    // Mutation to increment the visit count
    const { mutate: incrementVisit } = useMutation({
        mutationFn: () => axios.patch(`${serverUrl}/blogs/visit/${id}`),
    });

    // Fetch main blog details
    const { data: blog, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['blog', id],
        queryFn: async () => {
            const res = await axios.get(`${serverUrl}/blogs/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch recent posts for the sidebar
    const { data: recentBlogs = [] } = useQuery({
        queryKey: ['blogs', 'recent'],
        queryFn: async () => {
            const res = await axios.get(`${serverUrl}/blogs/latest`);
            // Filter out the current blog from the recent list
            return res.data.filter(p => p._id !== id);
        }
    });

    // --- FIX: Increment visit count only on successful data fetch ---
    useEffect(() => {
        if (isSuccess) {
            incrementVisit();
        }
    }, [isSuccess, incrementVisit]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (isLoading) {
        return <BlogDetailsSkeleton />;
    }

    if (isError || !blog) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <FaExclamationTriangle className="text-7xl text-error mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Article Not Found</h2>
                <p className="text-base-content/70 mb-6">We couldn't find the blog post you were looking for.</p>
                <Link to="/blog" className="btn btn-primary">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{`Aegis Life | ${blog.title}`}</title>
                <meta name="description" content={blog.content.substring(0, 160)} />
            </Helmet>

            <div className="bg-base-200 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li>{blog.title}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-2">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{blog.title}</h1>
                        <div className="flex items-center gap-4 text-base-content/70 mb-6">
                            <span className="flex items-center gap-2"><FaUserCircle /> {blog.authorName}</span>
                            <span className="flex items-center gap-2"><FaCalendarAlt /> {formatDate(blog.publishDate)}</span>
                        </div>
                        <img src={blog.image} alt={blog.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg" />
                        <div className="prose lg:prose-lg max-w-none text-base-content/90">
                            {/* Using dangerouslySetInnerHTML is okay if you trust the source (e.g., your own CMS) */}
                            {/* For untrusted sources, use a sanitizer like DOMPurify */}
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-8 sticky top-28 h-fit">
                        {/* Author Box */}
                        <div className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                <h3 className="card-title">About the Author</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="avatar">
                                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            {/* Replace with actual author image if available */}
                                            <img src={`https://ui-avatars.com/api/?name=${blog.authorName}&background=random`} alt={blog.authorName} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{blog.authorName}</h4>
                                        <p className="text-sm text-base-content/70">Insurance Specialist</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Posts */}
                        {recentBlogs.length > 0 && (
                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <h3 className="card-title">Recent Posts</h3>
                                    <ul className="space-y-4 mt-2">
                                        {recentBlogs.map(post => (
                                            <li key={post._id}>
                                                <Link to={`/blog/${post._id}`} className="flex items-center gap-4 group">
                                                    <img src={post.image} alt={post.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold leading-tight group-hover:text-primary transition-colors">{post.title}</h4>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
};

export default BlogDetails;