import { Metadata } from "next";
import Image from "next/image";
import React from "react";

import { ShinyButton } from "@/components/ui/shiny-button";
import posts from "@/data/post";

type Params = {
  nft: string;
};

// Generate dynamic paths for NFTs based on `posts`
export async function generateStaticParams(): Promise<Params[]> {
  return posts.map((post) => ({
    nft: post.id, // Use the post `id` for now
  }));
}

// Dynamically set metadata for NFTs
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = posts.find((p) => p.id === resolvedParams.nft);

  if (!post) {
    return {
      title: "NFT non trovato",
      description: "L'NFT richiesto non esiste.",
    };
  }

  return {
    title: post.title,
    description: `Acquista l'NFT "${post.title}" creato da ${post.author}.`,
  };
}

// Render the NFT page dynamically
const NFTPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const decodedNFTId = decodeURIComponent(resolvedParams.id);
  const post = posts.find((p) => p.id === decodedNFTId);

  if (!post) {
    return <div>NFT non trovato</div>;
  }

  return (
    <div className="md:mt-[-65px] min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-4xl font-title text-gradient text-center p-4 md:py-8 rounded-lg text-gradient animated-gradient px-8 md:px-12 mb-6">
          {post.title}
        </h1>

        {/* Image and Content Section */}
        <div className="flex max-md:flex-col max-md:items-center justify-between mx-8">
          {/* Image Section */}
          <div className="flex-1 md:w-full flex items-center justify-end relative overflow-hidden max-md:pb-8">
            <div className="max-md:w-[300px] max-md:h-[300px] h-[400px] max-w-[400px] relative">
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 md:pl-12 max-w-[400px] w-full flex flex-col items-start justify-start">
            <div className="mb-6">
              <h1 className="text-2xl font-title text-gradient mb-4">Testo:</h1>
              <p className="line-clamp-5">{post.content}</p>
            </div>
            <div className="mb-6">
              <h1 className="text-2xl font-title text-gradient mb-4">
                Autore:
              </h1>
              <p className="line-clamp-5">{post.author}</p>
            </div>
            <div className="mb-6">
              <h1 className="text-2xl font-title text-gradient mb-4">
                Prezzo:
              </h1>
              <p className="line-clamp-5">4.2 ETH</p>
            </div>
          </div>
        </div>

        {/* Buy NFT Button */}
        <div className="w-fit h-full p-[1px] border-gradient animated-gradient rounded-lg my-12">
          <div className="bg-background w-fit h-full rounded-lg">
            <ShinyButton className="font-title text-gradient">
              <p className="text-gradient">Acquista NFT</p>
            </ShinyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTPage;
