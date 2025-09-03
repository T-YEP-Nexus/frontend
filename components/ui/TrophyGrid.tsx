import React from "react";
import TrophyCard, { Trophy } from "./TrophyCard";

interface TrophyGridProps {
  trophies: Trophy[];
  title?: string;
  showCount?: boolean;
  gridCols?: 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
  onTrophyClick?: (trophy: Trophy, index: number) => void;
  clickable?: boolean;
}

const TrophyGrid: React.FC<TrophyGridProps> = ({
  trophies,
  title = "Médailles du projet",
  showCount = true,
  gridCols = 6,
  size = "md",
  showTooltip = true,
  className = "",
  onTrophyClick,
  clickable = false,
}) => {
  const gridColsClasses = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const obtainedCount = trophies.filter((t) => t.obtained).length;

  const handleTrophyClick = (trophy: Trophy) => {
    if (onTrophyClick) {
      const index = trophies.findIndex((t) => t.name === trophy.name);
      onTrophyClick(trophy, index);
    }
  };

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {showCount && (
            <span className="text-base font-normal text-gray-500">
              {obtainedCount}/{trophies.length}
            </span>
          )}
        </div>
      )}

      <div className={`grid ${gridColsClasses[gridCols]} gap-4 md:gap-6`}>
        {trophies.map((trophy, idx) => (
          <TrophyCard
            key={trophy.name}
            trophy={trophy}
            size={size}
            showTooltip={showTooltip}
            onClick={handleTrophyClick}
            clickable={clickable}
          />
        ))}
      </div>
    </div>
  );
};

export default TrophyGrid;
