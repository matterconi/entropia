"use client";

import React from "react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface Article {
  _id: string;
  title: string;
  coverImage: string;
  markdownPath?: string; // Percorso opzionale del file su Supabase
  author: string;
}

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [markdownContents, setMarkdownContents] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 📝 1️⃣ Recupera tutti gli articoli dal database
    async function fetchArticles() {
      try {
        const res = await fetch(`/api/articles`);
        if (!res.ok) throw new Error("Failed to fetch articles");
        const data = await res.json();
        setArticles(data);
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  useEffect(() => {
    // 📥 2️⃣ Scarica il contenuto Markdown solo per articoli con `markdownPath`
    async function fetchMarkdown(articleId: string, markdownPath: string) {
      try {
        const res = await fetch(`/api/supabase/download/${markdownPath}`);
        if (!res.ok)
          throw new Error(`Failed to fetch markdown for ${articleId}`);

        const { url } = await res.json();
        const markdownRes = await fetch(url);
        const markdownText = await markdownRes.text();

        setMarkdownContents((prev) => ({ ...prev, [articleId]: markdownText }));
      } catch (error) {
        console.error(`❌ Error downloading markdown for ${articleId}:`, error);
      }
    }

    articles.forEach((article) => {
      if (article.markdownPath) {
        fetchMarkdown(article._id, article.markdownPath);
      }
    });
  }, [articles]);

  if (loading) return <p className="text-center">Loading articles...</p>;
  if (articles.length === 0)
    return <p className="text-center">No articles found</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-8">
      {articles.map((article) => (
        <div key={article._id} className="p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
          <img
            src={article.coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-md mb-6"
          />

          {/* 🔥 Render Markdown solo se disponibile */}
          {article.markdownPath ? (
            <div className="prose max-w-5xl">
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {markdownContents[article._id] || "Loading content..."}
              </Markdown>
            </div>
          ) : (
            <p className="text-gray-500">No Markdown content available</p>
          )}
        </div>
      ))}
    </div>
  );
}
