"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { RainbowButton } from "@/components/ui/rainbow-button";
import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import ProfileForm from "@/app/(root)/users/[id]/UserUpdateForm";
import { User, BookMarked, BookOpen, Pen, Mail, ArrowLeft, X } from "lucide-react";

import DOMPurify from 'dompurify';


import { Post } from "@/types";

interface ProfileClientWrapperProps {
  posts: Post[];
}

export default function ProfileClientWrapper({ posts }: ProfileClientWrapperProps) {
  const { user, loading } = useUser();
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  // Funzione per gestire il cambio di visualizzazione e lo scroll
  const toggleProfileForm = (show: boolean) => {
    setShowProfileForm(show);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">User not found</p>;

  // Generate avatar using Dicebear with email as seed
  const emailSeed = user.email.split("@")[0];
  const avatarUrl = user.avatar || `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  // Se il form è attivo, mostra solo quello
  if (showProfileForm) {
    return (
      <div className="w-full">
        <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-xl shadow-lg mb-12 relative">
          {/* Pulsante X per chiudere in alto a destra */}
          <ProfileForm onClose={() => toggleProfileForm(false)} />
          
          <div className="w-full flex justify-center mt-8">
            <RainbowButton
              className="w-fit"
              onClick={() => toggleProfileForm(false)}
            >
              <ArrowLeft className="mr-2" size={16} />
              Torna al Profilo
            </RainbowButton>
          </div>
        </div>
      </div>
    );
  }

  // Altrimenti mostra il profilo normale
  return (
    <>
      {/* Hero Section */}
      <h1 className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center mb-8 text-gradient">{`Ciao, ${user.username}`}</h1>
      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
            {/* Avatar Column */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src={user.profileImg || avatarUrl}
                  alt={`${user.username} avatar`}
                  className="rounded-full size-40 md:size-48 border-4 border-primary/20 shadow-xl object-cover"
                />
                {user.isAuthor && (
                  <span className="absolute bottom-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Autore
                  </span>
                )}
              </div>
            </div>
            
            {/* User Info Column */}
            <div className="flex-1 md:ml-4">
                {/* Username box */}
                <div className="bg-card p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <User size={18} />
                        Username
                    </h3>
                    <p className="text-foreground/90">{user.username}</p>
                </div>

                {/* Email box with mail icon */}
                <div className="bg-card p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Mail size={18} />
                        Email
                    </h3>
                    <p className="text-foreground/90">{user.email}</p>
                </div>
                
                {/* Bio box */}
                <div className="bg-card p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <BookOpen size={18} className="text-foreground"/>
                        Bio
                    </h3>
                    {user.bio ? (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.bio) }} />
) : (
  <p className="text-muted-foreground italic">
    Nessuna bio disponibile. Clicca su "Modifica Profilo" per aggiungerne una.
  </p>
)}
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-card p-3 rounded-lg text-center shadow-sm flex-1">
                        <p className="text-2xl font-bold">{posts?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Articoli Preferiti</p>
                    </div>
                    
                    {user.isAuthor && (
                        <div className="bg-card p-3 rounded-lg text-center shadow-sm flex-1">
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Articoli Pubblicati</p>
                        </div>
                    )}
                    
                    <div className="bg-card p-3 rounded-lg text-center shadow-sm flex-1">
                        <p className="text-2xl font-bold">{new Date(Date.now()).getFullYear()}</p>
                        <p className="text-xs text-muted-foreground">Membro dal</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="w-full flex justify-center">
            <RainbowButton
              className="mt-12 w-fit"
              onClick={() => toggleProfileForm(true)}
            >
              Modifica Profilo
            </RainbowButton>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mt-12">
        <h2 className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center mb-16 text-gradient">
          Articoli Preferiti
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post: Post, i: number) => (
              <RelatedPostCard key={i} post={post} />
            ))
          ) : (
            <div className="col-span-full bg-card/50 rounded-lg p-8 text-center">
              <BookMarked size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nessun articolo tra i preferiti</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Esplora il sito e salva gli articoli che ti interessano
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Componente per caricare articoli (solo per autori) */}
      {user.isAuthor && (
        <div className="mt-16 bg-card p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Pen size={20} />
            Pubblica un Nuovo Articolo
          </h2>
          <ArticleUploadForm userId={user.id} />
        </div>
      )}
    </>
  );
}