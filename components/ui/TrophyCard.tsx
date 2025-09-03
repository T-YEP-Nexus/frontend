import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

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
}

const TrophyCard: React.FC<TrophyCardProps> = ({
  trophy,
  size = "md",
  showTooltip = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: {
      icon: "text-lg",
      text: "text-xs",
      tooltip: "bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs",
    },
    md: {
      icon: "text-2xl",
      text: "text-xs",
      tooltip: "bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 text-xs",
    },
    lg: {
      icon: "text-3xl",
      text: "text-sm",
      tooltip: "bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 text-sm",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center group relative ${className}`}>
      <FontAwesomeIcon
        icon={faMedal}
        className={`${currentSize.icon} ${
          trophy.obtained ? "text-yellow-400" : "text-gray-300 opacity-40"
        } transition-all duration-200 group-hover:scale-110`}
      />

      {showTooltip && (
        <span
          className={`absolute z-10 ${currentSize.tooltip} rounded bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg`}
        >
          {trophy.description}
        </span>
      )}

      <span
        className={`${currentSize.text} text-gray-700 mt-2 text-center break-words max-w-20`}
      >
        {trophy.name}
      </span>
    </div>
  );
};

export default TrophyCard;
