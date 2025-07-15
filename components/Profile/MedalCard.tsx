import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface MedalCardProps {
  name: string;
  icon: IconDefinition;
  index?: number;
  obtained: boolean;
  className?: string;
}

const MedalCard: React.FC<MedalCardProps> = ({
  name,
  icon,
  index = 0,
  obtained,
  className = "",
}) => {
  // Palette de couleurs modernisée pour les médailles
  const colorPalette = [
    {
      color: "text-yellow-600",
      bg: "from-yellow-50 to-yellow-100",
      border: "border-yellow-200",
      iconBg: "bg-yellow-200",
    },
    {
      color: "text-orange-600",
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-200",
    },
    {
      color: "text-purple-600",
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-200",
    },
    {
      color: "text-blue-600",
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-200",
    },
    {
      color: "text-red-600",
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      iconBg: "bg-red-200",
    },
    {
      color: "text-green-600",
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      iconBg: "bg-green-200",
    },
    {
      color: "text-indigo-600",
      bg: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      iconBg: "bg-indigo-200",
    },
    {
      color: "text-pink-600",
      bg: "from-pink-50 to-pink-100",
      border: "border-pink-200",
      iconBg: "bg-pink-200",
    },
  ];

  const color = colorPalette[index % colorPalette.length];

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 hover:scale-105 ${className} ${
        obtained
          ? `bg-gradient-to-br ${color.bg} border ${color.border} hover:shadow-lg`
          : "bg-gray-50 border border-gray-200 opacity-60 hover:opacity-80"
      }`}
    >
      <div
        className={`p-3 rounded-full mb-3 ${
          obtained ? color.iconBg : "bg-gray-200"
        }`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={`w-5 h-5 ${obtained ? color.color : "text-gray-400"}`}
        />
      </div>
      <span
        className={`text-xs text-center font-medium ${
          obtained ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {name}
      </span>
    </div>
  );
};

export default MedalCard;
