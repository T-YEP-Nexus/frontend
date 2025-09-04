"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  Building,
  BookOpen,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Award,
  Briefcase,
  Home,
  Settings,
  Database,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserIdFromToken } from "@/lib/auth";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

// Interfaces pour les données
interface DashboardStats {
  totalUsers: number;
  students: number;
  advisors: number;
  admins: number;
  totalProjects: number;
  activeProjects: number;
  totalPromotions: number;
  recentActivity: number;
}

interface RecentActivity {
  id: string;
  type: "user_created" | "project_created" | "promotion_created" | "login";
  description: string;
  timestamp: string;
  user?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  color: string;
  showDevelopmentBadge?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    students: 0,
    advisors: 0,
    admins: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalPromotions: 0,
    recentActivity: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions rapides
  const quickActions: QuickAction[] = [
    {
      title: "Gérer les utilisateurs",
      description: "Créer, modifier et gérer les comptes utilisateurs",
      icon: Users,
      href: "/admin/users/dashboard",
      color: "from-blue-600 to-blue-700",
    },
    {
      title: "Gérer les promotions",
      description: "Créer, modifier et visionner les promotions",
      icon: GraduationCap,
      href: "/admin/promotions",
      color: "from-green-600 to-green-700",
    },
    {
      title: "Gérer les informations",
      description: "Créer et gérer les annonces générales",
      icon: MessageSquare,
      href: "/admin/informations",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      title: "Import en masse",
      description: "Importer plusieurs utilisateurs via CSV",
      icon: FileText,
      href: "/admin/bulk-import",
      color: "from-purple-600 to-purple-700",
      showDevelopmentBadge: true,
    },
    {
      title: "Gérer les projets",
      description: "Voir et gérer tous les projets",
      icon: Briefcase,
      href: "/admin/projects",
      color: "from-orange-600 to-orange-700",
    },
  ];

  // Fonction pour récupérer les statistiques
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques des utilisateurs
      const profilesResponse = await fetch("http://localhost:3004/profiles", {
        credentials: "include",
      });
      const studentsResponse = await fetch("http://localhost:3004/students", {
        credentials: "include",
      });
      const advisorsResponse = await fetch("http://localhost:3004/advisors", {
        credentials: "include",
      });

      const profilesData = profilesResponse.ok
        ? await profilesResponse.json()
        : { success: false, data: [] };
      const studentsData = studentsResponse.ok
        ? await studentsResponse.json()
        : { success: false, data: [] };
      const advisorsData = advisorsResponse.ok
        ? await advisorsResponse.json()
        : { success: false, data: [] };

      // Récupérer les projets
      const projectsResponse = await fetch("http://localhost:3003/projects", {
        credentials: "include",
      });
      const projectsData = projectsResponse.ok
        ? await projectsResponse.json()
        : { success: false, data: [] };

      // Récupérer les promotions
      const promotionsResponse = await fetch(
        "http://localhost:3004/promotions",
        {
          credentials: "include",
        }
      );
      const promotionsData = promotionsResponse.ok
        ? await promotionsResponse.json()
        : { success: false, data: [] };

      // Calculer les statistiques
      const totalUsers = profilesData.success ? profilesData.data.length : 0;
      const students = studentsData.success ? studentsData.data.length : 0;
      const advisors = advisorsData.success ? advisorsData.data.length : 0;
      const admins = profilesData.success
        ? profilesData.data.filter((user: any) => user.roles_user === "admin")
            .length
        : 0;

      // Statistiques des projets
      const totalProjects = projectsData.success ? projectsData.data.length : 0;
      const activeProjects = projectsData.success
        ? projectsData.data.filter((project: any) => project.is_active).length
        : 0;

      // Statistiques des promotions
      const totalPromotions = promotionsData.success
        ? promotionsData.data.length
        : 0;
      const recentActivity = Math.floor(Math.random() * 20) + 10; // Garder temporairement

      setStats({
        totalUsers,
        students,
        advisors,
        admins,
        totalProjects,
        activeProjects,
        totalPromotions,
        recentActivity,
      });

      // Simuler des activités récentes
      const mockActivities: RecentActivity[] = [
        {
          id: "1",
          type: "user_created",
          description: "Nouvel utilisateur créé",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          user: "Jean Dupont",
        },
        {
          id: "2",
          type: "project_created",
          description: "Nouveau projet créé",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          user: "Marie Martin",
        },
        {
          id: "3",
          type: "promotion_created",
          description: "Nouvelle promotion créée",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: "Admin",
        },
        {
          id: "4",
          type: "login",
          description: "Connexion utilisateur",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          user: "Pierre Durand",
        },
      ];

      setRecentActivities(mockActivities);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les droits d'accès et charger les données
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          router.push("/login");
          return;
        }

        // Vérifier si l'utilisateur est admin
        const response = await fetch(
          `http://localhost:3004/profile/user/${userId}`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const userData = await response.json();
          if (
            userData.data.roles_user !== "admin" &&
            userData.data.roles_user !== "advisor"
          ) {
            router.push("/dashboard?error=unauthorized");
            return;
          }
          // Si admin, charger les données du dashboard
          await fetchDashboardData();
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits:", error);
        router.push("/login");
      }
    };

    checkAccessAndLoadData();
  }, [router]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return <Users size={16} className="text-blue-600" />;
      case "project_created":
        return <Briefcase size={16} className="text-green-600" />;
      case "promotion_created":
        return <GraduationCap size={16} className="text-purple-600" />;
      case "login":
        return <Activity size={16} className="text-orange-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440)
      return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (loading) {
    return <AdminLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 text-lg font-semibold">
              Erreur lors du chargement du dashboard
            </p>
            <p className="text-blue-800 text-sm mb-4">{error}</p>
            <Button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <Header
        title="Dashboard Administrateur"
        description="Bienvenue dans votre espace de gestion"
      />

      {/* Statistiques principales */}
      <AdminStatsCards
        size="small"
        stats={[
          {
            title: "Total Utilisateurs",
            value: stats.totalUsers,
            icon: <Users size={24} className="text-blue-600" />,
            color: "blue" as const,
            gradient: "from-blue-600 to-blue-800",
            bgGradient: "from-blue-100 to-blue-200",
            iconColor: "text-blue-600",
          },
          {
            title: "Projets Actifs",
            value: stats.activeProjects,
            icon: <Briefcase size={24} className="text-green-600" />,
            color: "green" as const,
            gradient: "from-green-600 to-green-800",
            bgGradient: "from-green-100 to-green-200",
            iconColor: "text-green-600",
          },
          {
            title: "Promotions",
            value: stats.totalPromotions,
            icon: <GraduationCap size={24} className="text-purple-600" />,
            color: "purple" as const,
            gradient: "from-purple-600 to-purple-800",
            bgGradient: "from-purple-100 to-purple-200",
            iconColor: "text-purple-600",
          },
          {
            title: "Activité Récente",
            value: stats.recentActivity,
            icon: <Activity size={24} className="text-orange-600" />,
            color: "orange" as const,
            gradient: "from-orange-600 to-orange-800",
            bgGradient: "from-orange-100 to-orange-200",
            iconColor: "text-orange-600",
            showDevelopmentBadge: true,
          },
        ]}
      />

      {/* Actions rapides */}
      <div className="mb-10">
        <h2 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const cardContent = (
              <div
                key={index}
                onClick={() => router.push(action.href)}
                className="group bg-white rounded-2xl shadow-lg p-6 border border-blue-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${action.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon size={24} className="text-white" />
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-blue-400 group-hover:text-blue-600 transition-colors duration-300"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                      {action.title}
                    </h3>
                    <p className="text-blue-600 text-sm group-hover:text-blue-500 transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            );

            if (action.showDevelopmentBadge) {
              return (
                <DevelopmentBadge key={index}>{cardContent}</DevelopmentBadge>
              );
            }

            return cardContent;
          })}
        </div>
      </div>

      {/* Statistiques détaillées et Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statistiques détaillées */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-blue-200/50">
          <h2 className="font-bold text-xl md:text-2xl text-blue-900 mb-4 md:mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            Statistiques détaillées
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-900 font-medium">Étudiants</p>
                  <p className="text-blue-600 text-sm">
                    Utilisateurs étudiants
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-blue-900">
                  {stats.students}
                </p>
                <p className="text-blue-600 text-sm">
                  {stats.totalUsers > 0
                    ? Math.round((stats.students / stats.totalUsers) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-green-900 font-medium">Conseillers</p>
                  <p className="text-green-600 text-sm">
                    Utilisateurs conseillers
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-green-900">
                  {stats.advisors}
                </p>
                <p className="text-green-600 text-sm">
                  {stats.totalUsers > 0
                    ? Math.round((stats.advisors / stats.totalUsers) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Shield size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-900 font-medium">Administrateurs</p>
                  <p className="text-purple-600 text-sm">
                    Utilisateurs administrateurs
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-purple-900">
                  {stats.admins}
                </p>
                <p className="text-purple-600 text-sm">
                  {stats.totalUsers > 0
                    ? Math.round((stats.admins / stats.totalUsers) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                  <Target size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-orange-900 font-medium">Taux de Projets</p>
                  <p className="text-orange-600 text-sm">
                    Projets actifs / total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-orange-900">
                  {stats.totalProjects > 0
                    ? Math.round(
                        (stats.activeProjects / stats.totalProjects) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-orange-600 text-sm">
                  {stats.activeProjects}/{stats.totalProjects}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <DevelopmentBadge>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                Activité récente
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium text-sm">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-blue-600 text-xs">
                        par {activity.user}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 text-xs font-medium">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/admin/users/dashboard")}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300"
              >
                Voir toutes les activités
              </Button>
            </div>
          </div>
        </DevelopmentBadge>
      </div>

      {/* Footer avec informations système */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-blue-800 font-semibold">
            Dashboard administrateur - Nexus
          </span>
        </div>
      </div>
    </div>
  );
}
