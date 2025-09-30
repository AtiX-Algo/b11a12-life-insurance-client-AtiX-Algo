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
import ManageApplications from './pages/Dashboard/ManageApplications/ManageApplications.jsx'; 
import ManageUsers from './pages/ManageUsers/ManageUsers.jsx';

import PrivateRoute from './routes/PrivateRoute.jsx';
import PolicyDetails from './pages/PolicyDetails.jsx';
import ApplicationForm from './pages/ApplicationForm.jsx';

// --- New Imports for Agent ---
import AgentRoute from './routes/AgentRoute.jsx';
import AssignedCustomers from './pages/Dashboard/AssignedCustomers/AssignedCustomers.jsx';

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
  // --- Dashboard Routes (Admin + Agent) ---
  {
    path: 'dashboard',
    // Use PrivateRoute to protect the whole dashboard
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      // --- Admin Routes ---
      { path: 'admin-home', element: <AdminRoute><AdminHome /></AdminRoute> },
      { path: 'manage-users', element: <AdminRoute><ManageUsers /></AdminRoute> },
      { path: 'manage-applications', element: <AdminRoute><ManageApplications /></AdminRoute> },
      { path: 'manage-policies', element: <AdminRoute><ManagePolicies /></AdminRoute> },
      { path: 'manage-blogs', element: <AdminRoute><ManageBlogs /></AdminRoute> },

      // --- Agent Routes ---
      { path: 'assigned-customers', element: <AgentRoute><AssignedCustomers /></AgentRoute> },
      { path: 'agent-home', element: <AgentRoute><div>Welcome Agent!</div></AgentRoute> } // Placeholder
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
