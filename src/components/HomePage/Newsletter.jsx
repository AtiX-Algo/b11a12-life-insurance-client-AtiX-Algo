import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Newsletter = () => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = data => {
        axios.post('http://localhost:5000/subscribe', { email: data.email })
            .then(() => {
                toast.success('Thank you for subscribing!');
                reset();
            })
            .catch(error => {
                if (error.response?.status === 409) {
                    toast.error('This email is already subscribed.');
                } else {
                    toast.error('Subscription failed. Please try again.');
                }
            });
    };

    return (
        <div className="my-16 p-10 bg-base-200 text-center">
            <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6 max-w-2xl mx-auto">Get the latest updates on new policies, insurance tips, and exclusive offers delivered straight to your inbox.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="join">
                <input
                    type="email"
                    {...register("email", { required: true })}
                    className="input input-bordered join-item"
                    placeholder="your-email@example.com"
                />
                <button type="submit" className="btn btn-primary join-item">Subscribe</button>
            </form>
        </div>
    );
};

export default Newsletter;