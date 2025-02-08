import React, { useId, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const MiniCTA = () => {
  const uniqueId = useId(); // Generate a unique ID for each button instance
  const [likes, setLikes] = useState(123); // Numero di like iniziale
  const [liked, setLiked] = useState(false); // Stato del like

  const toggleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4 ">
      {/* Like and Comment CTA */}
      <div className="flex items-center justify-start">
        {/* Like Section */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleLike}
            className="p-2 rounded-full "
            aria-label="Like"
          >
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
                className="w-6 h-6 "
                style={{
                  fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
                  filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                  transition: "transform 0.5s ease",
                }}
              />
            ) : (
              <AiOutlineHeart
                className="w-6 h-6 "
                style={{
                  fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
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
