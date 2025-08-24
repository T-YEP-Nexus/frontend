import React from "react";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

interface MainCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function MainCard({
  title,
  icon,
  children,
  className = "",
}: MainCardProps) {
  return (
    <DevelopmentBadge>
      <div className={`bg-white rounded-2xl p-8 shadow-xl ${className}`}>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </h2>
        {children}
      </div>
    </DevelopmentBadge>
  );
}
