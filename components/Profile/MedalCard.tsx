import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface MedalCardProps {
  name: string;
  icon: IconDefinition;
  color: string;
  obtained: boolean;
  className?: string;
}

const MedalCard: React.FC<MedalCardProps> = ({
  name,
  icon,
  color,
  obtained,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-lg transition-all ${className} ${
        obtained
          ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200"
          : "bg-gray-50 border border-gray-200 opacity-50"
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`w-6 h-6 mb-2 ${obtained ? color : "text-gray-400"}`}
      />
      <span
        className={`text-xs text-center font-medium ${
          obtained ? "text-blue-900" : "text-gray-500"
        }`}
      >
        {name}
      </span>
    </div>
  );
};

export default MedalCard;
