import React from 'react';
import Agents from '../components/Agents'; // The component we built first
import Hero from '../components/HeroSlider'; // Import the new Hero component

const Home = () => {
  return (
    <div>
      <Hero /> {/* Add the Hero slider here */}
      
      {/* This section can be a container for the rest of your page content */}
      <div className="container mx-auto px-4 py-8">
         <Agents />
      </div>
    </div>
  );
};

export default Home;