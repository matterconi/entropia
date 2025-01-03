"use client";

import React, { useState } from "react";

import Hero from "@/components/sections/Hero";
import LatestArticles from "@/components/sections/LatestArticles";

const Page = () => {
  return (
    <div className={`min-h-screen relative bg-[#020529]`}>
      <Hero />
      <LatestArticles />
    </div>
  );
};

export default Page;
