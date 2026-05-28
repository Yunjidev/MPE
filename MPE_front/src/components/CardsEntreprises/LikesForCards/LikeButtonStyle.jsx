/* eslint-disable react/prop-types */
import { FaHeart } from "react-icons/fa";
import { useState } from "react";

const LikeButtonStyle = ({ hasLiked, handleLike }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    setIsAnimating(true);
    handleLike(e);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      type="button"
      title={hasLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm"
    >
      {hasLiked && (
        <span className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
      )}
      <FaHeart
        className={`relative z-10 transition-all duration-300 ${
          hasLiked
            ? "text-rose-500"
            : isHovered
            ? "text-rose-400"
            : "text-[#879f98]"
        }`}
        style={{
          transform: isAnimating ? "scale(1.4)" : isHovered ? "scale(1.15)" : "scale(1)",
        }}
      />
    </button>
  );
};

export default LikeButtonStyle;
