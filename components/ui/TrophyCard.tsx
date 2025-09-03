import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import styles from "./TrophyCard.module.css";

export interface Trophy {
  name: string;
  obtained: boolean;
  description: string;
}

interface TrophyCardProps {
  trophy: Trophy;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
  onClick?: (trophy: Trophy) => void;
  clickable?: boolean;
}

const TrophyCard: React.FC<TrophyCardProps> = ({
  trophy,
  size = "md",
  showTooltip = true,
  className = "",
  onClick,
  clickable = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: {
      icon: "text-xl",
      text: "text-sm",
      tooltip: "bottom-10 left-1/2 -translate-x-1/2 px-3 py-2 text-sm",
    },
    md: {
      icon: "text-3xl",
      text: "text-sm",
      tooltip: "bottom-16 left-1/2 -translate-x-1/2 px-4 py-3 text-sm",
    },
    lg: {
      icon: "text-4xl",
      text: "text-base",
      tooltip: "bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 text-base",
    },
  };

  const currentSize = sizeClasses[size];

  const handleClick = () => {
    if (clickable && onClick) {
      // Déclencher l'animation
      setIsAnimating(true);

      // Appeler la fonction onClick
      onClick(trophy);

      // Arrêter l'animation après 600ms
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };

  return (
    <div
      className={`flex flex-col items-center group relative ${className} ${
        clickable ? "cursor-pointer" : ""
      } ${styles.medalStateChange}`}
      onClick={handleClick}
    >
      <FontAwesomeIcon
        icon={faMedal}
        className={`${currentSize.icon} ${
          trophy.obtained ? "text-yellow-400" : "text-gray-300 opacity-40"
        } transition-all duration-200 group-hover:scale-110 ${
          clickable ? "hover:scale-110" : ""
        } ${isAnimating ? styles.medalClick : ""}`}
      />

      {showTooltip && (
        <span
          className={`absolute z-10 ${currentSize.tooltip} rounded bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg group-hover:-translate-y-1`}
        >
          {trophy.description}
        </span>
      )}

      <span
        className={`${
          currentSize.text
        } text-gray-700 mt-2 text-center break-words max-w-20 ${
          isAnimating ? "animate-pulse" : ""
        }`}
      >
        {trophy.name}
      </span>

      {/* Effet de particules lors du clic */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Particules qui partent du centre avec animations CSS */}
          <div
            className={`absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full ${styles.particleExplosion}`}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400 rounded-full ${styles.particleExplosion}`}
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full ${styles.particleExplosion}`}
            style={{ animationDelay: "0.2s" }}
          ></div>

          {/* Effet de brillance */}
          <div
            className={`absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full ${styles.sparkle}`}
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TrophyCard;
