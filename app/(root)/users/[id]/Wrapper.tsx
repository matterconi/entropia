"use client";

import DOMPurify from "dompurify";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Calendar,
  FileText,
  Heart,
  Mail,
  Pen,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import ProfileForm from "@/app/(root)/users/[id]/UserUpdateForm";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useUser } from "@/context/UserContext";
import { Post } from "@/types";

interface ProfileClientWrapperProps {
  posts: Post[];
}

export default function ProfileClientWrapper({
  posts,
}: ProfileClientWrapperProps) {
  const { user, loading } = useUser();
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Funzione per gestire il cambio di visualizzazione e lo scroll
  const toggleProfileForm = (show: boolean) => {
    setShowProfileForm(show);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">User not found</p>;

  // Generate avatar using Dicebear with email as seed
  const emailSeed = user.email.split("@")[0];
  const avatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  // Se il form è attivo, mostra solo quello
  if (showProfileForm) {
    return (
      <>
        <h1 className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center mb-8 text-gradient">{`Ciao, ${user.username}`}</h1>

        <div className="w-full">
          <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-xl shadow-lg mb-12 relative">
            {/* Pulsante X per chiudere in alto a destra */}
            <ProfileForm onClose={() => toggleProfileForm(false)} />
          </div>
        </div>
      </>
    );
  }

  // Altrimenti mostra il profilo normale
  return (
    <>
      {/* Hero Section */}
      <h1 className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center mb-8 text-gradient">{`Ciao, ${user.username}`}</h1>
      <div className="w-full flex justify-center md:mb-24">
        <div className="w-fit">
          <div className="w-full p-6 flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* Left column - Profile Card */}
            <div className="rounded-xl shadow-lg overflow-hidden">
              <div className="flex flex-col items-center p-8">
                {/* Avatar con bordo sfumato */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-70 animate-pulse"></div>
                  <img
                    src={user.profileImg || avatarUrl}
                    alt={`${user.username || "User"} profile`}
                    className="relative rounded-full size-32 sm:size-40 border-4 border-white dark:border-slate-700 object-cover z-10"
                  />
                  {user.isAuthor && (
                    <span className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full z-10 font-medium">
                      Autore
                    </span>
                  )}
                </div>

                {/* Username */}
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {user.username || "Username"}
                </h2>

                {/* Email with subtle styling */}
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-6">
                  <Mail size={14} />
                  <span>{user.email || "email@example.com"}</span>
                </div>
                <div className="w-full flex justify-center mt-4 lg:hidden">
                  <RainbowButton
                    onClick={() => toggleProfileForm(true)}
                    className="w-fit"
                  >
                    <User size={20} />
                    Modifica Profilo
                  </RainbowButton>
                  {/* Componente per caricare articoli (solo per autori) */}
                </div>
                {true && (
                  <Link href={`/carica-articolo`}>
                    <div className="border-gradient animated-gradient rounded-lg p-[1px] lg:hidden mt-8">
                      <div className="bg-background rounded-lg">
                        <ShinyButton className="w-full flex items-center justify-center font-semibold px-6">
                          <Pen size={20} className="mr-2" />
                          Carica un Articolo
                        </ShinyButton>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Right column - Stats */}
            <div className="flex flex-col gap-4">
              {/* Bio with better formatting */}
              <div className="w-full rounded-lg p-5 bg-white dark:bg-slate-800 shadow-md">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <span className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                    <BookOpen
                      size={20}
                      className="text-purple-500 sm:size-6 size-5"
                    />
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold mb-1">
                    Bio
                  </span>
                </h3>

                {user.bio ? (
                  <div
                    className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic"
                    dangerouslySetInnerHTML={{
                      __html: user.bio,
                    }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                    Nessuna bio disponibile. Clicca su &quot;Modifica
                    Profilo&quot; per aggiungerne una.
                  </p>
                )}
              </div>

              {/* Stats cards in a responsive grid */}
              <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:gap-4">
                {/* Articles Read Stat */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold mb-1">
                        {posts?.length || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Articoli preferiti
                      </p>
                    </div>
                    <span className="bg-pink-100 dark:bg-pink-900/30 p-2 sm:p-3 rounded-lg">
                      <Heart
                        size={20}
                        className="text-pink-500 sm:size-6 size-5"
                      />
                    </span>
                  </div>
                </div>

                {/* Published Articles for Authors */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold mb-1">0</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Articoli pubblicati
                      </p>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                      <FileText
                        size={20}
                        className="text-blue-500 sm:size-6 size-5"
                      />
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold mb-1">
                        {new Date(Date.now()).getFullYear()}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Membro dal
                      </p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
                      <Calendar
                        size={20}
                        className="text-green-500 sm:size-6 size-5"
                      />
                    </span>
                  </div>
                </div>

                {/* Reading Time */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold mb-1">0</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Ore di lettura
                      </p>
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg">
                      <BookOpen
                        size={20}
                        className="text-amber-500 sm:size-6 size-5"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center mt-12 max-lg:hidden">
            <RainbowButton
              onClick={() => toggleProfileForm(true)}
              className="w-full"
            >
              <User size={20} />
              Modifica Profilo
            </RainbowButton>
          </div>
          {true && (
            <Link href={`/carica-articolo`}>
              <div className="border-gradient animated-gradient rounded-lg p-[1px] max-lg:hidden w-full mt-8">
                <div className="bg-background rounded-lg w-full">
                  <ShinyButton className="w-full flex items-center justify-center font-semibold">
                    <Pen size={20} className="mr-2 sm:size-6 size-5" />
                    Carica un Articolo
                  </ShinyButton>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
      {/* Posts Grid */}
      <div className="mt-12">
        <h2 className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center mb-16 text-gradient">
          Articoli Preferiti
        </h2>

        {false ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts && posts.length > 0 ? (
              posts.map((post: Post, i: number) => (
                <RelatedPostCard key={i} post={post} />
              ))
            ) : (
              <div className="col-span-full bg-card/50 rounded-lg p-8 text-center">
                <BookMarked
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground/50"
                />
                <p className="text-muted-foreground">
                  Nessun articolo tra i preferiti
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Esplora il sito e salva gli articoli che ti interessano
                </p>
              </div>
            )}
          </div>
        ) : (
          <NoArticlesScreen
            title="Non hai aggiunto articoli preferiti"
            message="Aggiungi articoli ai tuoi preferiti per averli sempre a portata di mano."
          />
        )}
      </div>
    </>
  );
}
