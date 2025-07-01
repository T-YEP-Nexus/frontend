import React from "react";

interface SkillCardProps {
  name: string;
  level: number;
  color: string;
  className?: string;
}

const SkillCard: React.FC<SkillCardProps> = ({
  name,
  level,
  color,
  className = "",
}) => {
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
