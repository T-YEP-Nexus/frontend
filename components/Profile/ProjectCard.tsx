import React from "react";

interface ProjectCardProps {
  name: string;
  grade?: number | null;
  status: "completed" | "in-progress" | "pending";
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  grade,
  status,
  className = "",
}) => {
  const statusConfig = {
    completed: {
      dot: "bg-green-500",
      label: "Terminé",
      badge: "bg-green-100 text-green-700 border-green-200",
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
    },
    "in-progress": {
      dot: "bg-blue-500",
      label: "En cours",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
    },
    pending: {
      dot: "bg-gray-400",
      label: "En attente",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      bg: "from-gray-50 to-gray-100",
      border: "border-gray-200",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center justify-between p-4 bg-gradient-to-br ${config.bg} rounded-lg border ${config.border} hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${config.dot} shadow-sm`}></div>
        <span className="font-semibold text-gray-900 text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {grade && (
          <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-md border border-gray-200">
            {grade}/20
          </span>
        )}
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium border ${config.badge}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
