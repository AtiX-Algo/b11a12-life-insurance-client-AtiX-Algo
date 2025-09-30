import React, { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import useAxiosSecure from '../../api/axiosSecure';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUserProfile, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit } = useForm();

    // Fetch the user's role from our database
    const { data: userRole, isLoading: isRoleLoading } = useQuery({
        queryKey: ['userRole', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/role/${user.email}`);
            return res.data.role;
        },
        enabled: !loading && !!user?.email,
    });
    
    // Mutation for updating profile
    const mutation = useMutation({
        mutationFn: async (profileData) => {
            // Update Firebase profile first
            await updateUserProfile(profileData.name, profileData.photoURL);
            // Then update the name in our backend
            await axiosSecure.patch(`/users/profile/${user.email}`, { name: profileData.name });
        },
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            // Invalidate user-related queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['userRole', user?.email] });
        },
        onError: () => toast.error('Profile update failed.')
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    if (loading || isRoleLoading) {
        return <div className="text-center my-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <Helmet><title>Aegis Life | My Profile</title></Helmet>
            <div className="max-w-2xl mx-auto card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <div className="avatar">
                        <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={user?.photoURL} alt={user?.displayName} />
                        </div>
                    </div>
                    <h2 className="card-title text-3xl mt-4">{user?.displayName}</h2>
                    <p>{user?.email}</p>
                    <div className="badge badge-lg badge-accent capitalize mt-2">{userRole}</div>
                </div>

                <div className="divider px-8">Update Your Profile</div>

                <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Full Name</span></label>
                        <input
                            type="text"
                            defaultValue={user?.displayName}
                            {...register("name", { required: true })}
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Photo URL</span></label>
                        <input
                            type="text"
                            defaultValue={user?.photoURL}
                            {...register("photoURL", { required: true })}
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;