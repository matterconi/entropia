import React from "react";

import SocialShareBar from "./SocialShareBar";

interface MiniFooterProps {
  title: string;
  author: string;
  authorBio: string;
}

const MiniFooter = ({ title, author, authorBio }: MiniFooterProps) => {
  return (
    <div className="self-start mt-8">
      <div className="flex items-center">
        <h1 className="font-title text-gradient text-3xl mb-8">{title}</h1>
      </div>
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-black mr-4 text-white flex items-center justify-center text-sm">
          MM
        </div>
        <h1 className="text-lg">{"Matteo Marconi"}</h1>
      </div>
      <p className="mt-4">
        {
          "Matteo è esperto nel perdere occasioni e guardare altri fare ciò che vorrebbe fare, isolarsi e staccarsi dal mondo, come una cozza al contrario"
        }
      </p>
      <div className="my-8">
        <SocialShareBar />
      </div>
    </div>
  );
};

export default MiniFooter;
