import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = data => {
    const notification = toast.loading('Subscribing...');
    axios.post('https://aegis-life-server.onrender.com/subscribe', { email: data.email })
      .then(() => {
        toast.success('Thank you for subscribing!', { id: notification });
        reset();
      })
      .catch(error => {
        if (error.response?.status === 409) {
          toast.error('This email is already subscribed.', { id: notification });
        } else {
          toast.error('Subscription failed. Please try again.', { id: notification });
        }
      });
  };

  return (
    <div
      className="hero min-h-[400px] bg-cover bg-center my-20 md:my-28"
      style={{ backgroundImage: "url('https://daisyui.com/images/stock/photo-1559755459-7d8b5a0a3c2f.jpg')" }}
    >
      <div className="hero-overlay bg-gradient-to-r from-blue-900/80 to-green-900/80"></div>
      <div className="hero-content text-center text-neutral-content py-16 px-4">
        <div className="max-w-md">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold">Stay Ahead with Our Newsletter</h2>
          <p className="mb-6">
            Get exclusive insights, new policy updates, and financial tips delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="form-control">
              <div className="join w-full">
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email"
                    }
                  })}
                  className="input input-bordered join-item w-full text-base-content"
                  placeholder="your-email@example.com"
                />
                <button type="submit" className="btn btn-primary join-item">Subscribe</button>
              </div>
              {errors.email && <span className="text-warning text-sm mt-2 text-left">{errors.email.message}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;