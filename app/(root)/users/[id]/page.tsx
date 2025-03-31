import React from "react";

import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Post } from "@/types";

import ProfileClientWrapper from "./Wrapper";

// Questo è il componente server che può usare async/await
export default async function UserProfilePage() {
  // Fetch dei post
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/articles`,
    {
      cache: "no-store", // Per avere dati sempre aggiornati
    },
  );

  const data = await response.json();
  const posts = data || [];

  return (
    <div className="mx-auto mt-12 p-6 lg:px-8 bg-background rounded-lg">
      {/* Wrapper Client Component per la parte che richiede UserContext */}
      <ProfileClientWrapper posts={posts} />
    </div>
  );
}
