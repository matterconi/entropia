import React from "react";

import CardsParallax from "@/components/sections/CardsParallax";
import Contacts from "@/components/sections/Contacts";
import Generi from "@/components/sections/Generi";
import Hero from "@/components/sections/Hero";

const Page = () => {
  return (
    <div className="">
      {/* Qui includiamo il componente per il rendering dei modal */}
      <Hero />
      <CardsParallax />
      <Generi />
      <Contacts />
    </div>
  );
};

export default Page;
