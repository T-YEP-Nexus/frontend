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
  // Palette de couleurs pour les compétences
  const colorPalette = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-blue-600",
    "bg-orange-500",
    "bg-red-500",
    "bg-indigo-500",
  ];

  const color = colorPalette[index % colorPalette.length];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium text-blue-900">{name}</span>
        <span className="text-sm text-blue-700/70">{level}%</span>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillCard;
