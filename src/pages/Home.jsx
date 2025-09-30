import React from 'react';
import Agents from '../components/Agents';
import HeroSlider from '../components/HeroSlider';
import PopularPolicies from '../components/HomePage/PopularPolicies';
import CustomerReviews from '../components/HomePage/CustomerReviews';
import Newsletter from '../components/HomePage/Newsletter';

const Home = () => {
  return (
    <div>
      <HeroSlider />
      <PopularPolicies />
      <CustomerReviews />
      <Newsletter />
      <Agents />
    </div>
  );
};

export default Home;