import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import required modules
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css/effect-fade'; // Import fade effect styles

const slides = [
  {
    bgImage: "url('https://t3.ftcdn.net/jpg/02/04/40/28/360_F_204402874_0gGy7GH5WAE6y6gtKa6dAnw8ZdY1anRQ.jpg')",
    title: "Secure Your Tomorrow, Today.",
    subtitle: "Comprehensive life insurance plans tailored for your peace of mind.",
    buttonText: "Get a Free Quote",
  },
  {
    bgImage: "url('https://thumbs.dreamstime.com/b/insurance-life-house-car-health-travel-business-health-concept-insurance-life-house-car-health-travel-business-health-concept-110360825.jpg')",
    title: "Protecting What Matters Most",
    subtitle: "Find the perfect policy to ensure your family's financial security.",
    buttonText: "Explore Policies",
  },
  {
    bgImage: "url('https://media.istockphoto.com/id/1355594068/photo/family-life-insurance-family-services-and-supporting-families-concepts.jpg?s=612x612&w=0&k=20&c=dufkyWLV214r_ThoLCYILxYDkYimd8qvEnX3qiYchrY=')",
    title: "Plan for a Brighter Future",
    subtitle: "Our expert agents are here to guide you every step of the way.",
    buttonText: "Meet Our Agents",
  },
];

const HeroSlider = () => {
  return (
    <div className="h-[calc(100vh-80px)] min-h-[600px] w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="mySwiper h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: slide.bgImage }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center  bg-opacity-60 text-center text-purple-600 p-4">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-blue-200 mb-8">
                    {slide.subtitle}
                  </p>
                  <button className="btn btn-primary btn-lg">{slide.buttonText}</button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;