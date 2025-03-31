import parse, { HTMLReactParserOptions } from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { ShinyButton } from "@/components/ui/shiny-button";

import SocialShareBar from "./SocialShareBar";

interface MiniFooterProps {
  title: string;
  author: Author;
  nftImage: string;
}

interface Author {
  _id: string;
  username: string;
  profileImg?: string;
  bio?: string;
}

const MiniFooter = ({ title, author, nftImage }: MiniFooterProps) => {
  const emailSeed = author.username;
  const avatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  // Configure options for html-react-parser
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (
        domNode.type === "tag" &&
        ["script", "iframe", "object", "embed"].includes(
          domNode.name.toLowerCase(),
        )
      ) {
        return <></>;
      }
    },
  };

  return (
    <div className="mt-8 w-full">
      {/* Titolo principale dell'articolo */}
      <div className="mb-10">
        <h1 className="font-title text-gradient text-3xl">{title}</h1>
      </div>

      {/* Layout verticale su mobile, orizzontale su tablet/desktop */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 md:min-h-[120px]">
        {/* Sezione autore */}
        <div className="flex flex-1 items-center justify-center md:min-h-[120px] h-full mb-10 md:mb-0 w-full ">
          {/* Avatar dell'autore */}
          <div className="mr-4 flex-shrink-0">
            <img
              src={
                author.profileImg !== "/default-profile.png"
                  ? author.profileImg
                  : avatarUrl
              }
              alt={`${author.username}'s avatar`}
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>

          {/* Dettagli autore */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 font-title text-gradient animated-gradient">
              {author.username}
            </h2>
            <div className="prose dark:prose-invert max-w-none text-sm">
              {author.bio ? (
                parse(author.bio, options)
              ) : (
                <p>{`${author.username} scrive su Versia. Quello che sappiamo è nel suo profilo.`}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sezione NFT - accoppiata immagine e bottone */}
        {/* Sezione NFT come link unico con border-gradient che circonda tutto */}
        <div className="w-full md:w-fit">
          <h3 className="font-title mb-4">
            Supporta <span className="text-gradient font-semibold">Versia</span>
            , compra{" "}
            <span className="text-gradient font-semibold">l&apos;NFT</span>
          </h3>

          <Link href={`/nft/${title.toLowerCase()}`} className="block">
            <div className="p-[1px] border-gradient animated-gradient rounded-lg">
              <div className="bg-background rounded-lg flex flex-row-reverse">
                {/* Immagine NFT */}
                <div className="w-full h-[80px] overflow-hidden rounded-tr-lg rounded-br-lg">
                  <Image
                    src={nftImage}
                    alt={title}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Bottone NFT Ufficiale */}
                <div className="w-full h-[80px] flex items-center">
                  <ShinyButton className="font-sans font-semibold p-2 px-6 h-full rounded-r-none">
                    <p className="text-gradient text-[0.8rem] font-semibold font-title text-center">
                      NFT Ufficiale
                    </p>
                  </ShinyButton>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Social share bar */}
      <div className="w-full mt-10">
        <SocialShareBar />
      </div>
    </div>
  );
};

export default MiniFooter;
