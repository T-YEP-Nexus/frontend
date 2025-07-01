import React from "react";

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 120,
  className = "",
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 20) / 2;

  let currentAngle = -Math.PI / 2; // Commencer en haut

  const createArc = (startAngle: number, endAngle: number) => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {data.map((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            const path = createArc(startAngle, endAngle);
            currentAngle = endAngle;

            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>
      </div>

      {/* Légende */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700">{item.label}</span>
            <span className="text-gray-500">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
