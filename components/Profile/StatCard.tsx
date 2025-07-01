import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: "blue" | "green" | "purple" | "orange";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  className = "",
}) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 text-blue-600 text-blue-900 text-blue-700/70",
    green:
      "from-green-50 to-green-100 text-green-600 text-green-900 text-green-700/70",
    purple:
      "from-purple-50 to-purple-100 text-purple-600 text-purple-900 text-purple-700/70",
    orange:
      "from-orange-50 to-orange-100 text-orange-600 text-orange-900 text-orange-700/70",
  };

  const [bgGradient, iconColor, valueColor, labelColor] =
    colorClasses[color].split(" ");

  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-lg p-4 text-center ${className}`}
    >
      <Icon className={`w-8 h-8 ${iconColor} mx-auto mb-2`} />
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className={`text-sm ${labelColor}`}>{label}</p>
    </div>
  );
};

export default StatCard;
