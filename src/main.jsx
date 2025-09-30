import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './app.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'

import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx' 
import AuthProvider from './context/AuthProvider.jsx'

import AllPolicies from './pages/AllPolicies.jsx'; 
import Blog from './pages/Blog.jsx'; 

import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminHome from './pages/Dashboard/AdminHome/AdminHome.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import ManagePolicies from './pages/Dashboard/ManagePolicies/ManagePolicies.jsx'; 
import ManageBlogs from './pages/Dashboard/ManageBlogs/ManageBlogs.jsx';
import ManageApplications from './pages/Dashboard/ManageApplications/ManageApplications.jsx'; // <-- IMPORTED

import PrivateRoute from './routes/PrivateRoute';
import PolicyDetails from './pages/PolicyDetails';
import ApplicationForm from './pages/ApplicationForm';
import ManageUsers from './pages/ManageUsers/ManageUsers.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { 
        path: "/all-policies",
        element: <AllPolicies />,
      },
      { 
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/policy/:id",
        element: <PolicyDetails />,
      },
      {
        path: "/application/:id",
        element: (
          <PrivateRoute>
            <ApplicationForm />
          </PrivateRoute>
        ),
      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  { 
    path: "/register",
    element: <Register />
  },
  // --- Admin Dashboard Route ---
  {
    path: 'dashboard',
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: 'admin-home',
        element: <AdminHome />
      },
      { 
        path: 'manage-applications', // <-- NEW ROUTE ADDED
        element: <ManageApplications />
      },
      {
        path: 'manage-policies',
        element: <ManagePolicies />
      },
      {
        path: 'manage-blogs',
        element: <ManageBlogs />
      },

      { 
        path: 'manage-users',
        element: <ManageUsers />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <Toaster />
        <RouterProvider router={router} />
      </HelmetProvider>
    </AuthProvider>
  </React.StrictMode>,
)
