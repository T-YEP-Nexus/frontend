import React from "react";

interface RadarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  size?: number;
  className?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 200,
  className = "",
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;
  const numPoints = data.length;

  // Générer les points du polygone
  const generatePoints = (scale: number) => {
    return data
      .map((_, index) => {
        const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * scale;
        const y = centerY + Math.sin(angle) * radius * scale;
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Générer les points pour les cercles de niveau
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Cercles de niveau */}
          {levels.map((level, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius * level}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity={0.3}
            />
          ))}

          {/* Lignes radiales */}
          {data.map((_, index) => {
            const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {/* Polygone des données */}
          <polygon
            points={generatePoints(1)}
            fill="rgba(25, 113, 255, 0.1)"
            stroke="#1971FF"
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
          />

          {/* Points de données */}
          {data.map((item, index) => {
            const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
            const scale = item.value / 100;
            const x = centerX + Math.cos(angle) * radius * scale;
            const y = centerY + Math.sin(angle) * radius * scale;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#1971FF"
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>

        {/* Labels */}
        {data.map((item, index) => {
          const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
          const x = centerX + Math.cos(angle) * (radius + 20);
          const y = centerY + Math.sin(angle) * (radius + 20);
          return (
            <div
              key={index}
              className="absolute text-xs font-medium text-gray-600"
              style={{
                left: x - 20,
                top: y - 8,
                transform: "translate(-50%, -50%)",
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadarChart;
