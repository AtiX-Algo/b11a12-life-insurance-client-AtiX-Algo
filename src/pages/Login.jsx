import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn, googleSignIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    // Handle login with email and password
    const handleLogin = data => {
        signIn(data.email, data.password)
            .then(result => {
                const user = result.user;
                console.log(user);
                toast.success('Login Successful!');
                navigate(from, { replace: true });
            })
            .catch(error => toast.error(error.message));
    }

    // Handle login with Google
    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(result => {
                const loggedInUser = result.user;
                console.log(loggedInUser);

                // Save user info to the database
                const saveUser = { name: loggedInUser.displayName, email: loggedInUser.email };
                axios.post('https://aegis-life-server.onrender.com/users', saveUser)
                    .then(() => {
                        toast.success('Login Successful!');
                        navigate(from, { replace: true });
                    })
                    .catch(err => toast.error(err.message));
            })
            .catch(error => toast.error(error.message));
    }

    return (
        <>
            <Helmet><title>Aegis Life | Login</title></Helmet>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content flex-col md:flex-row">
                    <div className="text-center md:w-1/2 lg:text-left">
                        <h1 className="text-5xl font-bold">Login now!</h1>
                        <p className="py-6">
                            Access your policy information, make payments, and connect with your agent. 
                            Your peace of mind is just a login away.
                        </p>
                    </div>
                    <div className="card md:w-1/2 max-w-sm shadow-2xl bg-base-100">
                        <form onSubmit={handleSubmit(handleLogin)} className="card-body">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input 
                                    type="email" 
                                    {...register("email", { required: true })} 
                                    name="email" 
                                    placeholder="email" 
                                    className="input input-bordered" 
                                />
                                {errors.email && <span className="text-red-600">Email is required</span>}
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input 
                                    type="password" 
                                    {...register("password", { required: true })} 
                                    name="password" 
                                    placeholder="password" 
                                    className="input input-bordered" 
                                />
                            </div>
                            <div className="form-control mt-6">
                                <input className="btn btn-primary" type="submit" value="Login" />
                            </div>
                        </form>
                        <p className="px-6 text-center">
                            New here? <Link to="/register" className="link link-primary">Create a New Account</Link>
                        </p>
                        <div className="divider px-6">OR</div>
                        <div className="p-6 pt-0 text-center">
                            <button onClick={handleGoogleSignIn} className="btn btn-outline w-full">
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
