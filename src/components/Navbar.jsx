import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useAdmin from '../hooks/useAdmin';
import useAgent from '../hooks/useAgent';
import Logo from '../assets/Aegis_Life.png'; 

const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);
    const { isAdmin } = useAdmin();
    const { isAgent } = useAgent();


    const handleLogOut = () => {
        logOut()
            .then(() => { })
            .catch(error => console.log(error));
    };

    const navLinks = (
        <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/all-policies">All Policies</Link></li>
            <li><Link to="/blog">Blog/Articles</Link></li>
            {user && isAdmin && isAgent && (
                <li><Link to="/dashboard/admin-home">Dashboard</Link></li>
            )}
             {user && <li><Link to="/dashboard/my-policies">My Policies</Link></li>}
        </>
    );

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="navbar-start">
                <div className="dropdown">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost lg:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[10] p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        {navLinks}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl">
                    <img src={Logo} alt="Aegis Life" className="w-10 h-10 mr-2" />Aegis Life
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {navLinks}
                </ul>
            </div>

            {/* Updated Navbar End with Dropdown Avatar */}
            <div className="navbar-end">
                {user ? (
                    <>
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User profile image"
                                        src={user.photoURL}
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content mt-3 z-[10] p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                <li className="p-2 font-semibold">{user.displayName}</li>
                                <li><Link to="/profile">My Profile</Link></li>
                                <li><button onClick={handleLogOut}>Logout</button></li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login</Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;
