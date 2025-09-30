import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../api/axiosSecure';
import { AuthContext } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const SubmitReview = () => {
    const { register, handleSubmit, reset } = useForm();
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newReview) => axiosSecure.post('/reviews', newReview),
        onSuccess: () => {
            toast.success('Thank you for your review!');
            // Invalidate and refetch the reviews query so the home page updates
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            reset();
        },
        onError: () => {
            toast.error('Submission failed. Please try again.');
        }
    });

    const onSubmit = (data) => {
        const reviewData = {
            userName: user.displayName,
            userImage: user.photoURL,
            rating: parseInt(data.rating),
            feedback: data.feedback,
        };
        mutation.mutate(reviewData);
    };

    return (
        <div>
            <Helmet><title>Dashboard | Submit Review</title></Helmet>
            <h1 className="text-3xl font-bold mb-6">Submit a Review</h1>
            <div className="card max-w-2xl mx-auto bg-base-100 shadow-xl">
                <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Rating</span></label>
                        <div className="rating rating-lg">
                            <input type="radio" {...register("rating")} value="1" className="mask mask-star-2 bg-orange-400" />
                            <input type="radio" {...register("rating")} value="2" className="mask mask-star-2 bg-orange-400" />
                            <input type="radio" {...register("rating")} value="3" className="mask mask-star-2 bg-orange-400" />
                            <input type="radio" {...register("rating")} value="4" className="mask mask-star-2 bg-orange-400" />
                            <input type="radio" {...register("rating")} value="5" className="mask mask-star-2 bg-orange-400" defaultChecked />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Your Feedback</span></label>
                        <textarea {...register("feedback", { required: true })} className="textarea textarea-bordered h-32" placeholder="Tell us about your experience..."></textarea>
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitReview;