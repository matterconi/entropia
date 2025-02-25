import React from "react";

import PostRenderer from "@/components/shared/PostRenderer";

// ✅ Funzione per ottenere i dati del post
const fetchPostData = async (postId: string) => {
  console.log("🔍 Caricamento post:", postId);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${postId}`,
    { cache: "no-store" }, // Evita caching dei dati per aggiornamenti in tempo reale
  );

  if (!res.ok) {
    throw new Error("Errore nel caricamento del post");
  }

  const postData = await res.json(); // Legge il JSON una sola volta
  console.log("✅ Post caricato con successo:", postData);
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
  console.log("🔍 ID del post:", postId);
  if (!postId) {
    return <div>⚠️ Post non valido</div>;
  }

  try {
    // 📥 Fetcha i dati del post
    const post = await fetchPostData(postId);

    if (!post) {
      return <div>⚠️ Post non trovato</div>;
    }

    return <PostRenderer post={post} />;
  } catch (error) {
    console.error("❌ Errore caricamento post:", error);
    return <div>⚠️ Errore nel caricamento del post.</div>;
  }
}

export default PostPage;
