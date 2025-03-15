"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover"; // Importa il componente di chiusura
import DOMPurify from "dompurify";
import React, { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BsThreeDots } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoClose, IoPaperPlane } from "react-icons/io5";
import { z } from "zod";

import TipTap from "@/components/editor/TipTap";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Usa il componente Popover che hai già definito
import { useUser } from "@/context/UserContext";
import useAuthModal from "@/hooks/useAuthModal";
import { User } from "@/types";

import RemoveCommentModal from "./RemoveCommentModal";
import UserNotVerifiedModal from "./UserNotVerifiedModal";

const commentSchema = z.object({
  comment: z
    .string()
    .min(5, "Il commento deve essere lungo almeno 5 caratteri.")
    .max(500, "Il commento non può superare i 500 caratteri."),
});

type CommentSchema = z.infer<typeof commentSchema>;

type CommentType = {
  _id: string;
  user: { _id: string; username: string; profileImg?: string };
  content: string;
  createdAt: string;
  isOwner?: boolean;
};

interface CommentSectionProps {
  id: string; // ID del post
}

const CommentSection = ({ id }: CommentSectionProps) => {
  const uniqueId = useId();
  const { user, loading } = useUser();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isClear, setIsClear] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);

  // Utilizza il hook per il modale di autenticazione
  const {
    isModalOpen,
    closeModal,
    checkUserCanPerformAction,
    isUserLoggedIn,
    user: modalUser,
  } = useAuthModal();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  });

  const commentValue = watch("comment");

  useEffect(() => {
    setIsClear(!commentValue);
  }, [commentValue]);

  // Funzione per recuperare i commenti (pag 5 per query)
  const fetchComments = React.useCallback(
    async (skip = 0, limit = 5) => {
      setLoadingComments(true);
      try {
        let url = `/api/comments?post=${id}&skip=${skip}&limit=${limit}`;
        if (user) {
          url += `&user=${user.id}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
        } else {
          console.error("Errore nel recupero dei commenti:", data.error);
        }
      } catch (err) {
        console.error("Errore nella richiesta dei commenti:", err);
      } finally {
        setLoadingComments(false);
      }
    },
    [id, user],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Aggiungi un nuovo commento tramite la route POST
  const handleAddComment = async (data: CommentSchema) => {
    // Controlla se l'utente può eseguire l'azione
    if (!checkUserCanPerformAction()) {
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user?.id,
          post: id,
          content: data.comment,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        fetchComments();
        reset();
      } else {
        alert(result.error || "Errore nell'aggiunta del commento");
      }
    } catch (err) {
      console.error("Errore nella richiesta per aggiungere commento:", err);
      alert("Errore di rete");
    }
  };

  // Rimuove un commento tramite la route DELETE
  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      alert("Devi essere autenticato per eliminare un commento");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.id,
          post: id,
          commentId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchComments();
      } else {
        alert(data.error || "Errore nella rimozione del commento");
      }
    } catch (err) {
      console.error("Errore nella richiesta per rimuovere commento:", err);
      alert("Errore di rete");
    }
  };

  // Modifica un commento tramite la route PUT
  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!user) {
      alert("Devi essere autenticato per modificare un commento");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.id,
          post: id,
          commentId,
          content: newContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchComments();
        setEditingCommentId(null);
      } else {
        alert(data.error || "Errore nella modifica del commento");
      }
    } catch (err) {
      console.error("Errore nella richiesta per modificare il commento:", err);
      alert("Errore di rete");
    }
  };

  if (loadingComments) {
    return (
      <div className="mt-8">
        {/* Visualizza un loading state se i commenti sono in fase di caricamento */}
        <h4 className="text-md font-semibold mb-2 text-gradient">
          Aggiungi un commento
        </h4>
        <form className="relative" onSubmit={handleSubmit(handleAddComment)}>
          <div className="h-full w-full border-gradient p-[1px] rounded-lg">
            <div className="h-full w-full bg-background rounded-lg">
              <Controller
                name="comment"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TipTap
                    value={field.value}
                    onChange={field.onChange}
                    isClear={isClear}
                    defaultValue={undefined}
                    editorType="editor"
                  />
                )}
              />
            </div>
          </div>
          <div className="absolute right-4 bottom-4 rounded-full w-8 h-8 border-gradient animated-gradient flex items-center justify-center">
            <button
              type="submit"
              className="flex items-center justify-center w-full h-full rounded-full"
            >
              <IoPaperPlane className="h-5 w-5 cursor-pointer text-foreground" />
            </button>
          </div>
        </form>
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1 pb-4">
            {errors.comment.message}
          </p>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Form per aggiungere un nuovo commento */}
      {isModalOpen && (
        <UserNotVerifiedModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isLogged={isUserLoggedIn}
          user={modalUser}
        />
      )}
      <h4 className="text-md font-semibold mb-2 text-gradient">
        Aggiungi un commento
      </h4>
      <form className="relative" onSubmit={handleSubmit(handleAddComment)}>
        <div className="h-full w-full border-gradient p-[1px] rounded-lg">
          <div className="h-full w-full bg-background rounded-lg">
            <Controller
              name="comment"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TipTap
                  value={field.value}
                  onChange={field.onChange}
                  isClear={isClear}
                  defaultValue={undefined}
                  editorType="editor"
                />
              )}
            />
          </div>
        </div>
        <div className="absolute right-4 bottom-4 rounded-full w-8 h-8 border-gradient animated-gradient flex items-center justify-center">
          <button
            type="submit"
            className="flex items-center justify-center w-full h-full rounded-full"
          >
            <IoPaperPlane className="h-5 w-5 cursor-pointer text-foreground" />
          </button>
        </div>
      </form>
      {errors.comment && (
        <p className="text-sm text-red-500 mt-1 pb-4">
          {errors.comment.message}
        </p>
      )}

      {/* Sezione commenti */}
      <div className="mt-6">
        <div className="flex items-center justify-start mb-4 space-x-2">
          <h3 className="font-semibold">
            {comments.length ? "Commenti" : "Nessun commento"}
          </h3>
          {comments.length > 0 && (
            <div className="border-gradient animated-gradient rounded-full py-1 px-2 text-xs font-medium">
              {comments.length}
            </div>
          )}
        </div>

        <ul className="space-y-4">
          {(showAll ? comments : comments.slice(-3)).map((comment) => (
            <li key={comment._id}>
              <div className="flex items-center gap-2">
                {editingCommentId !== comment._id && (
                  <>
                    <div className="h-6 w-6 bg-green-600 rounded-full text-foreground flex items-center justify-center">
                      {comment.user.username[0].toUpperCase()}
                    </div>
                    <strong>{comment.user.username}</strong>
                    <p className="text-xs py-1 self-end">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    {comment.isOwner && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="ml-2 text-gray-500 hover:text-gray-700 transition-colors">
                            <BsThreeDots className="h-5 w-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit">
                          <div className="flex flex-col space-y-1 bg-gray-100 dark:bg-slate-800 rounded-lg px-4 py-2">
                            <PopoverClose asChild>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditContent(comment.content);
                                }}
                                className="text-sm font-semibold text-left text-foreground px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                              >
                                Modifica
                              </button>
                            </PopoverClose>
                            <PopoverClose asChild>
                              <button
                                onClick={() => setIsOpen(true)}
                                className="text-sm font-semibold text-left text-foreground px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                              >
                                Cancella
                              </button>
                            </PopoverClose>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </>
                )}
                {/* Mostra il menu popup se l'utente è il proprietario */}
                {isOpen && (
                  <RemoveCommentModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onConfirm={() => {
                      handleDeleteComment(comment._id);
                      setIsOpen(false);
                    }}
                  />
                )}
              </div>
              {editingCommentId === comment._id ? (
                <>
                  <h4 className="text-md font-semibold mb-2 text-gradient">
                    Modifica
                  </h4>
                  <form
                    className="relative "
                    onSubmit={handleSubmit((data) =>
                      handleEditComment(comment._id, data.comment),
                    )}
                  >
                    {/* Bottone per annullare la modifica */}
                    <div
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent("");
                        reset();
                      }}
                    >
                      <IoClose className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="w-full border-gradient p-[1px] rounded-lg">
                      <div className="w-full bg-background rounded-lg">
                        <Controller
                          name="comment"
                          control={control}
                          defaultValue={comment.content}
                          render={({ field }) => (
                            <TipTap
                              value={field.value}
                              onChange={field.onChange}
                              isClear={isClear}
                              defaultValue={comment.content}
                              editorType="comment"
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="absolute right-4 bottom-4 rounded-full w-8 h-8 border-gradient animated-gradient flex items-center justify-center">
                      <button
                        type="submit"
                        className="flex items-center justify-center w-full h-full rounded-full"
                      >
                        <IoPaperPlane className="h-5 w-5 cursor-pointer text-foreground" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="ml-8">
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(comment.content, {
                        ALLOWED_TAGS: [
                          "strong",
                          "b",
                          "em",
                          "i",
                          "s",
                          "del",
                          "h1",
                          "h2",
                          "h3",
                          "ul",
                          "li",
                          "blockquote",
                          "p",
                        ],
                        ALLOWED_ATTR: ["style"],
                      }),
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>

        {comments.length > 3 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <p className="text-gradient">
              {showAll ? "Mostra meno" : "Mostra tutti i commenti"}
            </p>
            <div
              className="cursor-pointer"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <FaChevronUp className="h-5 w-5" />
              ) : (
                <FaChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
