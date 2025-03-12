"use client";

import React, { useId, useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useUser } from "@/context/UserContext"; // Assicurati che il percorso sia corretto
import UserNotVerifiedModal from "./UserNotVerifiedModal";
import { User } from "@/types";
import useAuthModal from "@/hooks/useAuthModal";


interface MiniCTAProps {
  id: string; // ID del post
  likeCount: number; // Numero di like iniziale
}

const MiniCTA = ({ id, likeCount }: MiniCTAProps) => {
  const uniqueId = useId();
  const { user, loading } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likeCount);
  
  // Utilizza il hook per il modale di autenticazione
  const { isModalOpen, closeModal, checkUserCanPerformAction, isUserLoggedIn, user: modalUser } = useAuthModal();
  // Funzione per controllare se l'utente ha messo like a questo post
  const checkLikeStatus = async () => {
    if (!user) {
      setLiked(false);
      return;
    }
    console.log(user);
    try {
      const res = await fetch(`/api/like?user=${user.id}&post=${id}`);
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
      } else {
        console.error("Errore nel controllo del like:", data.error);
      }
    } catch (err) {
      console.error("Errore nella richiesta per il like:", err);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      checkLikeStatus();
    }
  }, [user, loading, id]);

  const toggleLike = async () => {
    // Controlla se l'utente può eseguire l'azione
    if (!checkUserCanPerformAction()) {
      return;
    }

    if (liked) {
      // Rimuove il like se già presente
      try {
        const res = await fetch("/api/like", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user?.id, post: id }),
        });
        const data = await res.json();
        if (res.ok) {
          setLiked(false);
          setLikes(data.likeCount);
        } else {
          alert(data.error || "Errore nella rimozione del like");
        }
      } catch (err) {
        console.error("Errore nella richiesta per rimuovere il like:", err);
        alert("Errore di rete");
      }
    } else {
      // ... resto del codice per aggiungere il like
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isModalOpen && (
        <UserNotVerifiedModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isLogged={isUserLoggedIn}
          user={modalUser}
        />
      )}
      <div className="flex items-center justify-start">
        <div className="flex items-center justify-center">
          <button onClick={toggleLike} className="p-2 rounded-full" aria-label="Like">
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                  id={`gradient-${uniqueId}`}
                >
                  <stop offset="0%" stopColor="#00f5ff" />
                  <stop offset="50%" stopColor="#ff00f7" />
                  <stop offset="100%" stopColor="#ffb400" />
                </linearGradient>
              </defs>
            </svg>
            {liked ? (
              <AiFillHeart
                className="w-6 h-6"
                style={{
                  fill: `url(#gradient-${uniqueId})`,
                  filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                  transition: "transform 0.5s ease",
                }}
              />
            ) : (
              <AiOutlineHeart
                className="w-6 h-6"
                style={{
                  fill: `url(#gradient-${uniqueId})`,
                  filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                  transition: "transform 0.5s ease",
                }}
              />
            )}
          </button>
          <span className="text-xs">{likes}</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCTA;
