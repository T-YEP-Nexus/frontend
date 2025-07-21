import React from "react";
import { Wrench } from "lucide-react";

interface DevelopmentBadgeProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const DevelopmentBadge: React.FC<DevelopmentBadgeProps> = ({
  className = "",
  size = "md",
  variant = "default",
}) => {
  const sizeClasses = {
    xs: "px-1.5 py-1 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const variantClasses = {
    default: "bg-orange-100 text-orange-700 border border-orange-200",
    outline: "bg-transparent text-orange-600 border border-orange-300",
    ghost: "bg-orange-50 text-orange-600 border-0",
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        transition-all duration-200 hover:scale-105 cursor-default
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <Wrench size={iconSizes[size]} className="flex-shrink-0" />
      {size !== "xs" ? (
        <span>En développement</span>
      ) : (
        <span className="text-[10px]">En développement</span>
      )}
    </div>
  );
};

export default DevelopmentBadge;
