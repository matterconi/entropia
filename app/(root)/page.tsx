import React from "react";

import CardsParallax from "@/components/sections/CardsParallax";
import Contacts from "@/components/sections/Contacts";
import Footer from "@/components/sections/Footer";
import Generi from "@/components/sections/Generi";
import Hero from "@/components/sections/Hero";

const Page = () => {
  return (
    <div className="min-h-screen bg-background relative h-full">
      {/* Qui includiamo il componente per il rendering dei modal */}
      <Hero />
      <CardsParallax />
      <Generi />
      <Contacts />
      <Footer />
    </div>
  );
};

export default Page;
