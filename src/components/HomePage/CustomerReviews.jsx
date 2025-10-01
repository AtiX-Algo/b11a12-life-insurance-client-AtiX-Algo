import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const CustomerReviews = () => {
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/reviews');
      return res.data;
    },
  });

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
          <p className="text-lg text-base-content/70 mt-2">
            Real stories from clients who trust us with their future.
          </p>
        </div>

        {isLoading && (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {isError && <p className="text-center text-error">Failed to load reviews.</p>}

        {!isLoading && !isError && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={30}
            slidesPerView={1}
            className="pb-12"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review._id}>
                <div className="card max-w-3xl mx-auto bg-base-100 shadow-xl p-8 text-center">
                  <div className="avatar justify-center mb-4">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={review.userImage} alt={review.userName} />
                    </div>
                  </div>
                  <blockquote className="text-lg italic text-base-content/80 my-4">
                    "{review.feedback}"
                  </blockquote>
                  <div className="rating rating-md justify-center mt-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <input
                        key={i}
                        type="radio"
                        name={`rating-${review._id}`}
                        className="mask mask-star-2 bg-yellow-400"
                        disabled
                        checked={i < review.rating}
                      />
                    ))}
                  </div>
                  <p className="text-xl font-semibold mt-2">{review.userName}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default CustomerReviews;