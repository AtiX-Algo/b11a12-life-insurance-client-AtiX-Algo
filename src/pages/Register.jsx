import React, { useContext } from 'react';
import { useForm } from "react-hook-form";
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Register = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createUser, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = data => {
        createUser(data.email, data.password)
            .then(result => {
                const loggedUser = result.user;
                console.log(loggedUser);

                updateUserProfile(data.name, data.photoURL)
                    .then(() => {
                        // Save user info to the database
                        const saveUser = { name: data.name, email: data.email };
                        axios.post('https://aegis-life-server.onrender.com/users', saveUser)
                            .then(res => {
                                if (res.data) { // Or check for a specific success status
                                    reset();
                                    toast.success('Registration successful!');
                                    navigate('/');
                                }
                            })
                            .catch(error => toast.error(error.message));
                    })
                    .catch(error => toast.error(error.message));
            })
            .catch(error => toast.error(error.message));
    };

    return (
        <>
            <Helmet><title>Aegis Life | Register</title></Helmet>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Register now!</h1>
                        <p className="py-6">Join us to start your journey towards a secure future. Creating an account is quick and easy.</p>
                    </div>
                    <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Name</span></label>
                                <input
                                    type="text"
                                    {...register("name", { required: true })}
                                    placeholder="Your Name"
                                    className="input input-bordered"
                                />
                                {errors.name && <span className="text-red-600">Name is required</span>}
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Photo URL</span></label>
                                <input
                                    type="text"
                                    {...register("photoURL", { required: true })}
                                    placeholder="Photo URL"
                                    className="input input-bordered"
                                />
                                {errors.photoURL && <span className="text-red-600">Photo URL is required</span>}
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Email</span></label>
                                <input
                                    type="email"
                                    {...register("email", { required: true })}
                                    placeholder="Email"
                                    className="input input-bordered"
                                />
                                {errors.email && <span className="text-red-600">Email is required</span>}
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Password</span></label>
                                <input
                                    type="password"
                                    {...register("password", {
                                        required: true,
                                        minLength: 6,
                                        pattern: /(?=.*[A-Z])(?=.*[a-z])/
                                    })}
                                    placeholder="Password"
                                    className="input input-bordered"
                                />
                                {errors.password?.type === 'required' && <p className="text-red-600">Password is required</p>}
                                {errors.password?.type === 'minLength' && <p className="text-red-600">Password must be at least 6 characters</p>}
                                {errors.password?.type === 'pattern' && <p className="text-red-600">Password must have one uppercase and one lowercase letter</p>}
                            </div>
                            <div className="form-control mt-6">
                                <input className="btn btn-primary" type="submit" value="Register" />
                            </div>
                        </form>
                        <p className="px-6 text-center mb-4">
                            Already have an account? <Link to="/login" className="link link-primary">Please Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
