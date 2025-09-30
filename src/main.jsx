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
import Register from './pages/Register.jsx' // <-- Import Register
import AuthProvider from './context/AuthProvider.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  { // <-- Add the register route
    path: "/register",
    element: <Register />
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