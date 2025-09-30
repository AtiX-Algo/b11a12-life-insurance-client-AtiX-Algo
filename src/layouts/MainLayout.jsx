import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // We will create this next

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        {/* The content of your pages will be rendered here */}
        <Outlet />
      </main>
      {/* We can add a Footer component here later */}
    </div>
  );
};

export default MainLayout;