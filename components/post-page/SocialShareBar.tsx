import Image from "next/image";
import React from "react";

const socialMedia = [
  {
    id: 1,
    img: "/icons/git.svg",
    name: "GitHub",
    link: "https://github.com/",
  },
  {
    id: 2,
    img: "/icons/twit.svg",
    name: "Twitter",
    link: "https://twitter.com/",
  },
  {
    id: 3,
    img: "/icons/link.svg",
    name: "LinkedIn",
    link: "https://linkedin.com/",
  },
];
const SocialShareBar = () => {
  return (
    <div className="flex items-center justify-center gap-4 h-full font-title text-gradient">
      Share on Social
      {socialMedia.map((media) => (
        <a
          key={media.id}
          href={media.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full shadow-md hover:scale-105 transition-transform"
          aria-label={`Share on ${media.name}`}
        >
          <Image
            src={media.img}
            alt={media.name}
            width={24}
            height={24}
            className="group-hover:opacity-80"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialShareBar;
