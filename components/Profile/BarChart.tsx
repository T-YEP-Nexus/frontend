import React from "react";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
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

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="text-gray-600">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                item.color || "bg-blue-500"
              }`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
