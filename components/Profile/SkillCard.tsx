import React from "react";

interface SkillCardProps {
  name: string;
  level: number;
  index?: number;
  className?: string;
}

const SkillCard: React.FC<SkillCardProps> = ({
  name,
  level,
  index = 0,
  className = "",
}) => {
  // Palette de couleurs modernisée pour les compétences
  const colorPalette = [
    {
      bg: "from-blue-500 to-blue-600",
      text: "text-blue-700",
      bgLight: "bg-blue-100",
    },
    {
      bg: "from-green-500 to-green-600",
      text: "text-green-700",
      bgLight: "bg-green-100",
    },
    {
      bg: "from-purple-500 to-purple-600",
      text: "text-purple-700",
      bgLight: "bg-purple-100",
    },
    {
      bg: "from-orange-500 to-orange-600",
      text: "text-orange-700",
      bgLight: "bg-orange-100",
    },
    {
      bg: "from-red-500 to-red-600",
      text: "text-red-700",
      bgLight: "bg-red-100",
    },
    {
      bg: "from-indigo-500 to-indigo-600",
      text: "text-indigo-700",
      bgLight: "bg-indigo-100",
    },
    {
      bg: "from-pink-500 to-pink-600",
      text: "text-pink-700",
      bgLight: "bg-pink-100",
    },
    {
      bg: "from-teal-500 to-teal-600",
      text: "text-teal-700",
      bgLight: "bg-teal-100",
    },
  ];

  const color = colorPalette[index % colorPalette.length];

  return (
    <div
      className={`p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-900 text-sm">{name}</span>
        <span className={`text-xs font-medium ${color.text}`}>{level}%</span>
      </div>
      <div
        className={`w-full ${color.bgLight} rounded-full h-2.5 overflow-hidden`}
      >
        <div
          className={`bg-gradient-to-r ${color.bg} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillCard;
