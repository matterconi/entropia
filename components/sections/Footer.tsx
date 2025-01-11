"use client";

import React from "react";
import { FaLocationArrow } from "react-icons/fa";

import { socialMedia } from "@/data/data";

import { RainbowButton } from "../ui/rainbow-button";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative bg-background h-[500px] pt-20 pb-10 w-full overflow-hidden"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {/* Wrapper for fixed sticky effect */}
      <div className="fixed bottom-0 inset-x-0 h-[500px] max-w-full mx-auto flex flex-col items-center justify-end">
        {/* Content */}
        <div className="flex flex-col items-center justify-end w-full px-4 h-full">
          <h1 className="text-3xl lg:max-w-[45vw] text-center font-title">
            <span className=" text-gradient animated-gradient font-semibold">
              Entropia{" "}
            </span>{" "}
            <br />
            Ti aspetta
          </h1>
          <p className="text-white-200 md:mt-10 my-5 text-center mx-8 md">
            Stiamo cercando scrittori, artisti e creatori di contenuti per il
            sito. Se sei interessato, contattaci!
          </p>
          <p className="text-white-200 text-center mx-8 md font-semibold">
            entropia@swag.com
          </p>
        </div>

        {/* Footer Bottom Section */}
        <div className="flex mt-16 md:flex-row flex-col justify-center items-center md:gap-8 px-4 mb-8">
          <p className=":text-base text-sm md:font-normal font-light max-md:mb-8 text-center">
            Copyright © 2025{" "}
            <span className="font-tile text-gradient">3NTR0P14</span>
          </p>
          <div className="flex items-center md:gap-3 gap-6">
            {socialMedia.map((profile) => (
              <div
                key={profile.id}
                className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300"
              >
                <img
                  src={profile.img}
                  alt={profile.id}
                  width={20}
                  height={20}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
