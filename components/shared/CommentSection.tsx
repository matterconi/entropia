import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor } from "@tiptap/react";
import DOMPurify from "dompurify";
import { FileDiff } from "lucide-react";
import { comment } from "postcss";
import React, { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoPaperPlane } from "react-icons/io5";
import { z } from "zod";

import TipTap from "@/components/shared/TipTap";

const commentSchema = z.object({
  comment: z
    .string()
    .min(5, "Il commento deve essere lungo almeno 5 caratteri.")
    .max(500, "Il commento non può superare i 500 caratteri."),
});

type CommentSchema = z.infer<typeof commentSchema>;

const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
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
    ALLOWED_ATTR: ["style"], // Consenti solo lo stile inline
  });
};

type Comment = {
  id: number;
  author: string;
  text: string;
};

const CommentSection = () => {
  const uniqueId = useId(); // Generate a unique ID for each button instance
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isClear, setIsClear] = useState(true);

  const handleAddComment = (data: string) => {
    console.log(data.trim());
    if (data.trim() !== "") {
      console.log("Aggiungi commento:", data);
      setComments((prev) => [
        ...prev,
        { id: prev.length + 1, author: "Anonimo", text: data },
      ]);
    }
    console.log(comments);
  };

  const commentValue = watch("comment");

  useEffect(() => {
    if (commentValue) {
      setIsClear(false);
    } else {
      setIsClear(true);
    }
  }, [commentValue]);

  return (
    <div className="mt-8">
      {/* Commenti Recenti */}
      <div className="relative w-full">
        <h4 className="text-md font-semibold mb-2 text-gradient">
          Aggiungi un commento
        </h4>
        <form
          className="relative"
          onSubmit={handleSubmit((data) => {
            handleAddComment(data.comment); // Stampa i dati nella console
            reset(); // Resetta il form
          })}
        >
          {/* Textarea */}
          <div className="h-full w-full border-gradient p-[1px] rounded-lg">
            <div className="h-full w-full bg-background  rounded-lg">
              <Controller
                name="comment"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TipTap
                    value={field.value}
                    onChange={field.onChange}
                    isClear={isClear}
                  />
                )}
              />
            </div>
          </div>

          {/* Button */}
          <div className="absolute right-4 bottom-4 rounded-full w-8 h-8 border-gradient animated-gradient flex items-center justify-center">
            <button
              type="submit" // Importante per invocare l'onSubmit del form
              className="flex items-center justify-center w-full h-full rounded-full"
            >
              <IoPaperPlane className="h-5 w-5 cursor-pointer text-foreground" />
            </button>
          </div>
        </form>
      </div>
      {errors.comment && (
        <p className="text-sm text-red-500 mt-1 pb-4">
          {errors.comment.message}
        </p>
      )}
      <div className="mt-6">
        <div className="flex items-center justify-start mb-4 space-x-2">
          <h3 className="font-semibold ">
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
            <li key={comment.id}>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-green-600 rounded-full text-foreground">
                  AU
                </div>
                <strong>{comment.author}</strong>
                <p className="text-xs py-1 self-end">37 minutes ago</p>
              </div>
              {/* Renderizza l'HTML sanificato */}
              <div
                className="text-sm ml-8"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(comment.text),
                }}
              />
            </li>
          ))}
        </ul>

        {comments.length > 3 && (
          <div className="flex items-center justify-center gap-2  mt-4">
            <p className="text-gradient">
              {showAll ? "Mostra meno" : "Mostra tutti i commenti"}
            </p>
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
            {showAll ? (
              <FaChevronUp
                className="h-5 w-5 ml-1 flex-shrink-0"
                style={{
                  fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
                  filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                  transition: "transform 0.5s ease",
                }}
                onClick={() => setShowAll(false)}
              />
            ) : (
              <FaChevronDown
                className="h-5 w-5 ml-1 flex-shrink-0"
                style={{
                  fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
                  filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                  transition: "transform 0.5s ease",
                }}
                onClick={() => setShowAll(true)}
              />
            )}
          </div>
        )}
      </div>
      {/* Nuovo Commento */}
    </div>
  );
};

export default CommentSection;
