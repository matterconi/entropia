import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const SocialShareBar = () => {
  return (
    <div className="flex items-center justify-center gap-4 w-full z-10 font-title">
      <div className="flex items-center font-medium">
        <span className="mr-2">
          Condividi sui <br />
          <span className="text-gradient font-semibold">Social</span>
        </span>
      </div>

      <a
        href="#"
        className="bg-blue-400 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        aria-label="Share on Twitter"
      >
        <div className="flex items-center justify-center w-10 h-10">
          <FaTwitter size={20} />
        </div>
      </a>

      <a
        href="#"
        className="bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        aria-label="Share on Facebook"
      >
        <div className="flex items-center justify-center w-10 h-10">
          <FaFacebook size={20} />
        </div>
      </a>

      <a
        href="#"
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        aria-label="Share on Instagram"
      >
        <div className="flex items-center justify-center w-10 h-10">
          <FaInstagram size={20} />
        </div>
      </a>
    </div>
  );
};

export default SocialShareBar;
