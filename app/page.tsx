import React from "react";

import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/sections/Hero";

const page = () => {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <Hero />
    </div>
  );
};

export default page;
