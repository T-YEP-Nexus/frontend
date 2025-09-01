import React from "react";
import { Wrench } from "lucide-react";

interface DevelopmentBadgeProps {
  children: React.ReactNode;
  className?: string;
}

const DevelopmentBadge: React.FC<DevelopmentBadgeProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Badge "En développement" - juste l'icône en rond */}
      <div className="absolute top-2 right-2 z-20 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center">
        <Wrench size={12} />
      </div>

      {/* Contenu barré en noir et blanc */}
      <div className="grayscale opacity-50 pointer-events-none select-none">
        <div className="relative">
          {children}
          {/* Ligne de barré diagonale - moins de traits */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-400 to-transparent opacity-30"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 8px)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBadge;
