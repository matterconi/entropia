import React from "react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import ProfileClientWrapper from "./Wrapper";

import { Post } from "@/types"

// Questo è il componente server che può usare async/await
export default async function UserProfilePage() {
  // Fetch dei post
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/articles`, {
    cache: 'no-store' // Per avere dati sempre aggiornati
  });
  
  const data = await response.json();
  console.log(data);
  const posts = data || [];

  return (
    <div className="mx-auto mt-12 p-6 lg:px-8 bg-background rounded-lg">
      {/* Wrapper Client Component per la parte che richiede UserContext */}
      <ProfileClientWrapper posts={posts} />
    </div>
  );
}