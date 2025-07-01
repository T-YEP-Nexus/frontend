import React from "react";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  maxValue?: number;
  height?: number;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 120,
  className = "",
}) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  // Palette de couleurs pour les barres
  const colorPalette = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#EF4444", // red
    "#06B6D4", // cyan
    "#F97316", // orange
    "#EC4899", // pink
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => {
        const color = colorPalette[index % colorPalette.length];

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-600">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
