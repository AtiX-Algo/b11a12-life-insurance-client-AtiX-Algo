import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const CustomerReviews = () => {
  // Fetch reviews using TanStack Query
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/reviews');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-red-500">Failed to load reviews.</p>;
  }

  return (
    <div className="my-16 container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-10">
        What Our Customers Say
      </h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ delay: 5000 }}
        spaceBetween={30}
        slidesPerView={1}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review._id} className="pb-12">
            <div className="card max-w-2xl mx-auto bg-base-100 shadow-lg p-6 text-center">
              <div className="avatar justify-center">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={review.userImage} alt={review.userName} />
                </div>
              </div>
              <p className="py-4 italic">"{review.feedback}"</p>
              <h3 className="text-xl font-semibold">{review.userName}</h3>
              <div className="rating justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <input
                    key={i}
                    type="radio"
                    name={`rating-${review._id}`}
                    className="mask mask-star-2 bg-orange-400"
                    disabled
                    checked={i < review.rating}
                  />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CustomerReviews;
