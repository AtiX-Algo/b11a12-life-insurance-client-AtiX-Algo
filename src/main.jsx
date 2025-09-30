import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './app.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- IMPORT

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
import MyPolicies from './pages/Dashboard/MyPolicies/MyPolicies.jsx';

import AgentRoute from './routes/AgentRoute.jsx';
import AssignedCustomers from './pages/Dashboard/AssignedCustomers/AssignedCustomers.jsx';


import SubmitReview from './pages/Dashboard/SubmitReview/SubmitReview.jsx';
import Payment from './pages/Dashboard/Payment/Payment.jsx';

import ManageTransactions from './pages/Dashboard/ManageTransactions/ManageTransactions.jsx';
import PaymentHistory from './pages/Dashboard/PaymentHistory/PaymentHistory.jsx';
import ClaimRequest from './pages/Dashboard/ClaimRequest/ClaimRequest.jsx';
import PolicyClearance from './pages/Dashboard/PolicyClearance/PolicyClearance.jsx';
import Profile from './pages/Profile/Profile.jsx';
import QuotePage from './pages/QuotePage';
import ManageBlogsAgent from './pages/Dashboard/ManageBlogsAgent/ManageBlogsAgent.jsx';
import BlogDetails from './pages/BlogDetails.jsx';


// Create a Query Client
const queryClient = new QueryClient()

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
        path: "/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
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
        path: "/blog/:id", // <-- ADD THIS DYNAMIC ROUTE
        element: <BlogDetails />,
      },
      {
        path: "/policy/:id",
        element: <PolicyDetails />,
      },
      {
        path: "/quote/:id",
        element: <PrivateRoute><QuotePage /></PrivateRoute>,
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
  // --- Dashboard Routes (Admin + Agent + Customer) ---
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
      {
        path: 'manage-transactions',
        element: <AdminRoute><ManageTransactions /></AdminRoute>
      },

      // --- Agent Routes ---
      { path: 'assigned-customers', element: <AgentRoute><AssignedCustomers /></AgentRoute> },
      { path: 'agent-home', element: <AgentRoute><div>Welcome Agent!</div></AgentRoute> },
      {
        path: 'manage-my-blogs',
        element: <AgentRoute><ManageBlogsAgent /></AgentRoute>
      },
      {
        path: 'policy-clearance',
        element: <AgentRoute><PolicyClearance /></AgentRoute>
      },

      // --- Customer Routes ---
      { path: 'my-policies', element: <MyPolicies /> },
      { path: 'submit-review', element: <SubmitReview /> },
      {
        path: 'payment/:id',
        element: <Payment />
      },
      {
        path: 'payment-history',
        element: <PaymentHistory />
      },
      {
        path: 'request-claim',
        element: <ClaimRequest />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}> {/* <-- WRAP THE APP */}
        <HelmetProvider>
          <Toaster />
          <RouterProvider router={router} />
        </HelmetProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
)
