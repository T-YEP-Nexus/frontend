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

  // Générer les points du polygone avec les vraies valeurs
  const generateDataPoints = () => {
    return data.map((item, index) => {
      const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
      const scale = item.value / 100;
      const x = centerX + Math.cos(angle) * radius * scale;
      const y = centerY + Math.sin(angle) * radius * scale;
      return { x, y, angle, value: item.value, label: item.label };
    });
  };

  // Générer les points pour les cercles de niveau
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Créer le path pour l'aire colorée
  const createAreaPath = () => {
    const points = generateDataPoints();
    if (points.length === 0) return "";

    const pathData =
      points
        .map((point, index) => {
          if (index === 0) {
            return `M ${point.x} ${point.y}`;
          }
          return `L ${point.x} ${point.y}`;
        })
        .join(" ") + " Z";

    return pathData;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Définition des dégradés */}
          <defs>
            {/* Dégradé pour l'aire principale */}
            <radialGradient id="areaGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </radialGradient>

            {/* Dégradé pour le contour */}
            <linearGradient
              id="outlineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>

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
              opacity="0.3"
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
                opacity="0.3"
              />
            );
          })}

          {/* Aire colorée avec dégradé */}
          <path
            d={createAreaPath()}
            fill="url(#areaGradient)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Contour avec dégradé */}
          <path
            d={createAreaPath()}
            fill="none"
            stroke="url(#outlineGradient)"
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
          />

          {/* Points de données simples */}
          {generateDataPoints().map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3B82F6"
              className="transition-all duration-1000 ease-out"
            />
          ))}
        </svg>

        {/* Labels en dehors du radar chart avec pourcentages */}
        {data.map((item, index) => {
          const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
          const x = centerX + Math.cos(angle) * (radius + 35);
          const y = centerY + Math.sin(angle) * (radius + 35);

          // Ajuster la position du texte selon l'angle
          let textAlign = "left";
          let transform = "translate(0, -50%)";

          if (angle >= -Math.PI / 6 && angle <= Math.PI / 6) {
            // Droite
            textAlign = "left";
            transform = "translate(0, -50%)";
          } else if (angle > Math.PI / 6 && angle <= (5 * Math.PI) / 6) {
            // Bas
            textAlign = "center";
            transform = "translate(-50%, 0)";
          } else if (angle > (5 * Math.PI) / 6 || angle < (-5 * Math.PI) / 6) {
            // Gauche
            textAlign = "right";
            transform = "translate(0, -50%)";
          } else {
            // Haut
            textAlign = "center";
            transform = "translate(-50%, -100%)";
          }

          return (
            <div
              key={index}
              className="absolute text-xs font-medium text-gray-600"
              style={{
                left: x,
                top: y,
                transform: transform,
                textAlign: textAlign as any,
              }}
            >
              <div>{item.label}</div>
              <div className="font-bold text-blue-600">{item.value}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadarChart;
