"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./swiper.css";

import React from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import FeaturedPost from "@/components/shared/FeaturedPost";

import { Post } from "@/types"

interface FeaturedPostProps {
  posts: Post[];
  isNew?: boolean;
}

const FeaturedPostSlider: React.FC<FeaturedPostProps> = ({ posts, isNew }) => {
  return (
    <div className="mt-8 max-md:px-6 px-12 flex items-center justify-center w-screen">
      {/* Add padding to the container */}
      <div className="relative w-full ">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          breakpoints={{
            1000: {
              slidesPerView: 2, // Show 2 slides for screens >= 1000px
              spaceBetween: 30, // Adjust spacing between slides
            },
          }}
          navigation
          autoplay={{ delay: 3000 }}
          loop={true} // Enable loop
          className="w-full"
        >
          {posts.map((post, index) => (
            <SwiperSlide
              key={index}
              className="flex flex-col xl:flex-row w-full"
            >
              <FeaturedPost post={post} isNew={isNew} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedPostSlider;
