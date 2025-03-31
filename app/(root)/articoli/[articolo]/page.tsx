import React from "react";

import PostRenderer from "@/components/post-page/PostRenderer";
import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import { Post } from "@/types";

const relatedPosts: Post[] = [];

// ✅ Funzione per ottenere i dati del post
const fetchPostData = async (postId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${postId}`,
    { cache: "no-store" }, // Evita caching dei dati per aggiornamenti in tempo reale
  );

  if (!res.ok) {
    throw new Error("Errore nel caricamento del post");
  }

  const postData = await res.json(); // Legge il JSON una sola volta
  return postData;
};

type PostPageProps = {
  params: Promise<{}>;
  searchParams: Promise<Record<string, string | undefined>>;
};

// ✅ Server Component che usa `searchParams` in modo sincrono
async function PostPage({
  params, // Non ci interessa, ma va definito
  searchParams,
}: PostPageProps) {
  const resolvedSearchParams = await searchParams;
  const postId = resolvedSearchParams.id;
  if (!postId) {
    return <div>⚠️ Post non valido</div>;
  }

  try {
    // 📥 Fetcha i dati del post
    const post = await fetchPostData(postId);
    if (!post) {
      return <div>⚠️ Post non trovato</div>;
    }

    return (
      <>
        <PostRenderer post={post} id={postId} />
        <div className="max-md:px-6 px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mt-4">
          {relatedPosts.map((post: Post, i: number) => (
            <RelatedPostCard key={i} post={post} />
          ))}
        </div>
      </>
    );
  } catch (error) {
    console.error("❌ Errore caricamento post:", error);
    return <div>⚠️ Errore nel caricamento del post.</div>;
  }
}

export default PostPage;
