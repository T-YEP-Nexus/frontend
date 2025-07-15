import React from "react";
import {
  MessageSquare,
  Eye,
  EyeOff,
  Users,
  Calendar,
  FolderOpen,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  FileText,
  Clock,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple" | "red" | "indigo";
  gradient: string;
  bgGradient: string;
  iconColor: string;
}

interface AdminStatsCardsProps {
  stats: StatCard[];
  size?: "small" | "medium" | "large";
}

const getColorClasses = (color: StatCard["color"]) => {
  switch (color) {
    case "blue":
      return {
        gradient: "from-blue-600 to-blue-800",
        bgGradient: "from-blue-100 to-blue-200",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200/50",
      };
    case "green":
      return {
        gradient: "from-green-600 to-green-800",
        bgGradient: "from-green-100 to-green-200",
        iconColor: "text-green-600",
        borderColor: "border-green-200/50",
      };
    case "orange":
      return {
        gradient: "from-orange-600 to-orange-800",
        bgGradient: "from-orange-100 to-orange-200",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200/50",
      };
    case "purple":
      return {
        gradient: "from-purple-600 to-purple-800",
        bgGradient: "from-purple-100 to-purple-200",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200/50",
      };
    case "red":
      return {
        gradient: "from-red-600 to-red-800",
        bgGradient: "from-red-100 to-red-200",
        iconColor: "text-red-600",
        borderColor: "border-red-200/50",
      };
    case "indigo":
      return {
        gradient: "from-indigo-600 to-indigo-800",
        bgGradient: "from-indigo-100 to-indigo-200",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200/50",
      };
    default:
      return {
        gradient: "from-blue-600 to-blue-800",
        bgGradient: "from-blue-100 to-blue-200",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200/50",
      };
  }
};

const getSizeClasses = (size: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return {
        container: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        card: "p-4",
        title: "text-xs",
        value: "text-2xl",
        icon: "w-6 h-6",
        iconContainer: "p-2",
      };
    case "medium":
      return {
        container: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        card: "p-6",
        title: "text-sm",
        value: "text-4xl",
        icon: "w-8 h-8",
        iconContainer: "p-4",
      };
    case "large":
      return {
        container: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        card: "p-8",
        title: "text-base",
        value: "text-5xl",
        icon: "w-10 h-10",
        iconContainer: "p-5",
      };
    default:
      return {
        container: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        card: "p-6",
        title: "text-sm",
        value: "text-4xl",
        icon: "w-8 h-8",
        iconContainer: "p-4",
      };
  }
};

export default function AdminStatsCards({
  stats,
  size = "medium",
}: AdminStatsCardsProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`grid ${sizeClasses.container} gap-6 mb-10`}>
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);

        return (
          <div
            key={index}
            className={`group bg-white rounded-2xl shadow-lg ${sizeClasses.card} border ${colorClasses.borderColor} hover:shadow-2xl hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`${sizeClasses.title} ${colorClasses.iconColor} font-medium mb-1`}
                >
                  {stat.title}
                </p>
                <p
                  className={`${sizeClasses.value} font-bold bg-gradient-to-r ${colorClasses.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className={`${sizeClasses.iconContainer} bg-gradient-to-br ${colorClasses.bgGradient} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
              >
                <div className={sizeClasses.icon}>{stat.icon}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Composants d'aide pour créer facilement des stats cards communes
export const createInformationsStats = (
  total: number,
  active: number,
  inactive: number
) => [
  {
    title: "Total Informations",
    value: total,
    icon: <MessageSquare size={32} className="text-blue-600" />,
    color: "blue" as const,
    gradient: "from-blue-600 to-blue-800",
    bgGradient: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
  },
  {
    title: "Informations Actives",
    value: active,
    icon: <Eye size={32} className="text-green-600" />,
    color: "green" as const,
    gradient: "from-green-600 to-green-800",
    bgGradient: "from-green-100 to-green-200",
    iconColor: "text-green-600",
  },
  {
    title: "Informations Inactives",
    value: inactive,
    icon: <EyeOff size={32} className="text-orange-600" />,
    color: "orange" as const,
    gradient: "from-orange-600 to-orange-800",
    bgGradient: "from-orange-100 to-orange-200",
    iconColor: "text-orange-600",
  },
];

export const createUsersStats = (
  total: number,
  active: number,
  inactive: number
) => [
  {
    title: "Total Utilisateurs",
    value: total,
    icon: <Users size={32} className="text-blue-600" />,
    color: "blue" as const,
    gradient: "from-blue-600 to-blue-800",
    bgGradient: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
  },
  {
    title: "Utilisateurs Actifs",
    value: active,
    icon: <UserCheck size={32} className="text-green-600" />,
    color: "green" as const,
    gradient: "from-green-600 to-green-800",
    bgGradient: "from-green-100 to-green-200",
    iconColor: "text-green-600",
  },
  {
    title: "Utilisateurs Inactifs",
    value: inactive,
    icon: <UserX size={32} className="text-red-600" />,
    color: "red" as const,
    gradient: "from-red-600 to-red-800",
    bgGradient: "from-red-100 to-red-200",
    iconColor: "text-red-600",
  },
];

export const createProjectsStats = (
  total: number,
  active: number,
  completed: number
) => [
  {
    title: "Total Projets",
    value: total,
    icon: <FolderOpen size={32} className="text-blue-600" />,
    color: "blue" as const,
    gradient: "from-blue-600 to-blue-800",
    bgGradient: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
  },
  {
    title: "Projets Actifs",
    value: active,
    icon: <BookOpen size={32} className="text-green-600" />,
    color: "green" as const,
    gradient: "from-green-600 to-green-800",
    bgGradient: "from-green-100 to-green-200",
    iconColor: "text-green-600",
  },
  {
    title: "Projets Terminés",
    value: completed,
    icon: <FileText size={32} className="text-purple-600" />,
    color: "purple" as const,
    gradient: "from-purple-600 to-purple-800",
    bgGradient: "from-purple-100 to-purple-200",
    iconColor: "text-purple-600",
  },
];

export const createPromotionsStats = (
  total: number,
  active: number,
  inactive: number
) => [
  {
    title: "Total Promotions",
    value: total,
    icon: <GraduationCap size={32} className="text-blue-600" />,
    color: "blue" as const,
    gradient: "from-blue-600 to-blue-800",
    bgGradient: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
  },
  {
    title: "Promotions Actives",
    value: active,
    icon: <Calendar size={32} className="text-green-600" />,
    color: "green" as const,
    gradient: "from-green-600 to-green-800",
    bgGradient: "from-green-100 to-green-200",
    iconColor: "text-green-600",
  },
  {
    title: "Promotions Inactives",
    value: inactive,
    icon: <Clock size={32} className="text-orange-600" />,
    color: "orange" as const,
    gradient: "from-orange-600 to-orange-800",
    bgGradient: "from-orange-100 to-orange-200",
    iconColor: "text-orange-600",
  },
];
