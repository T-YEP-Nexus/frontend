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
      badge: "bg-green-100 text-green-700",
    },
    "in-progress": {
      dot: "bg-blue-500",
      label: "En cours",
      badge: "bg-blue-100 text-blue-700",
    },
    pending: {
      dot: "bg-gray-400",
      label: "En attente",
      badge: "bg-gray-100 text-gray-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center justify-between p-3 bg-blue-50 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
        <span className="font-medium text-blue-900">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {grade && (
          <span className="text-sm font-medium text-blue-700">{grade}/20</span>
        )}
        <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
