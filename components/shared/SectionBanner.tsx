"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import React from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import Tag from "@/components/shared/Tag";

import { RainbowButton } from "../ui/rainbow-button";

interface Post {
  title: string;
  chapter: number;
  chapterTitle: string;
  author: string;
  authorBio: string;
  image: string;
  content: string;
  tags: { label: string; type: string }[];
}

interface FeaturedPostProps {
  posts: Post[];
  isNew?: boolean;
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ posts, isNew }) => {
  return (
    <div className="mt-8 max-md:mx-6 mx-12 flex justify-center border-gradient h-[450px] rounded-lg animated-gradient">
      <div className="mx-8 w-full flex flex-col items-center justify-between my-12">
        <h1 className="bg-background p-8 w-full text-center text-4xl font-title rounded-lg">
          Il Lexoverse ti aspetta! 🌈 Scopri i nostri contenuti ed entra a far
          parte della Community più ganza del web!
        </h1>
        <RainbowButton>Scopri</RainbowButton>
      </div>
    </div>
  );
};

export default FeaturedPost;
