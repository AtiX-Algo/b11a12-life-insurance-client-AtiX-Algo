import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const HeroSlider = () => {
  return (
    <div className="h-[600px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        className="mySwiper h-full w-full"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div
            className="h-full w-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg')" }}
          >
            <div className="bg-black bg-opacity-50 text-white text-center p-8 rounded-lg">
              <h1 className="text-5xl font-bold mb-4">Secure Your Tomorrow Today</h1>
              <p className="text-lg mb-6">Comprehensive life insurance plans tailored for your peace of mind.</p>
              <button className="btn btn-primary">Get a Free Quote</button>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div
            className="h-full w-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('https://daisyui.com/images/stock/photo-1559755459-7d8b5a0a3c2f.jpg')" }}
          >
            <div className="bg-black bg-opacity-50 text-white text-center p-8 rounded-lg">
              <h1 className="text-5xl font-bold mb-4">Protecting Your Loved Ones</h1>
              <p className="text-lg mb-6">Find the perfect policy to ensure your family's financial security.</p>
              <button className="btn btn-primary">Explore Policies</button>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div
            className="h-full w-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('https://daisyui.com/images/stock/photo-1416339442236-8ceb164046f8.jpg')" }}
          >
            <div className="bg-black bg-opacity-50 text-white text-center p-8 rounded-lg">
              <h1 className="text-5xl font-bold mb-4">Plan for a Brighter Future</h1>
              <p className="text-lg mb-6">Our expert agents are here to guide you every step of the way.</p>
              <button className="btn btn-primary">Meet Our Agents</button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HeroSlider;