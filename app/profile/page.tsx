"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Edit,
  Mail,
  Phone,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  LogOut,
  Loader2,
  Badge,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { faMedal, faCrown, faFire } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/Header/Header";
import SkillCard from "@/components/Profile/SkillCard";
import MedalCard from "@/components/Profile/MedalCard";
import ProjectCard from "@/components/Profile/ProjectCard";
import ProfileSection from "@/components/Profile/ProfileSection";
import ProgressRing from "@/components/Profile/ProgressRing";
import RadarChart from "@/components/Profile/RadarChart";
import ImageUploadModal from "@/components/Profile/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken, isTokenExpired } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoading from "@/components/admin/AdminLoading";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

const ProfilePage = () => {
  const router = useRouter();
  // État pour le modal d'image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fonction pour traduire les rôles
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Étudiant";
      case "advisor":
        return "Conseiller";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  // Hook pour les données utilisateur
  const { userData, loading, error, updateProfileImageUrl } = useUserData(
    getUserIdFromToken()
  );

  useEffect(() => {
    // Redirection automatique pour les admins/advisor
    if (userData && !loading && !error) {
      if (userData.role === "admin" || userData.role === "advisor") {
        console.log(
          "Redirection automatique vers /admin/profile pour admin/advisor"
        );
        window.location.href = "/admin/profile";
        return;
      }
    }

    // Détecter si nous sommes en mode offline (services indisponibles)
    if (error) {
      // Handle both string and Error object cases
      const errorMessage = typeof error === "string" ? error : error || "";
      if (errorMessage.includes("Failed to fetch")) {
        setIsOfflineMode(true);
      }
    }
  }, [userData, loading, error]);

  // Gestion du changement d'image
  const handleImageChange = async (newImageUrl: string) => {
    try {
      await updateProfileImageUrl(newImageUrl);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image:", error);
    }
  };

  // Affichage du loading
  if (loading) {
    return <AdminLoading message="Chargement du profil..." />;
  }

  // Affichage d'erreur critique uniquement si pas de userData du tout
  if (error && !userData) {
    const errorMessage =
      typeof error === "string" ? error : error || "Erreur inconnue";

    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              Erreur critique lors du chargement du profil
            </p>
            <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  // Si pas de userData mais pas d'erreur critique, quelque chose ne va pas
  if (!userData) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Aucune donnée utilisateur disponible
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  // Données par défaut si les stats ne sont pas disponibles
  const defaultStats = {
    totalHours: 0,
    projectsCompleted: 0,
    ectsCredits: 0,
    attendanceRate: 0,
    skills: [],
    recentProjects: [],
    badges: [],
  };

  const defaultChartData = {
    skillsRadar: [],
  };

  // Utiliser les données par défaut si nécessaire
  const stats = userData.stats || defaultStats;
  const chartData = userData.chartData || defaultChartData;

  const handleLogout = async () => {
    try {
      // Récupérer le token depuis les cookies
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );
      const token = tokenCookie ? tokenCookie.split("=")[1] : null;

      if (token) {
        const response = await fetch("http://localhost:3001/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          // Supprimer toutes les données du localStorage et cookies
          localStorage.clear(); // Nettoie tout le localStorage
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";

          // Rediriger vers la page de login
          window.location.href = "/login";
        }
      } else {
        // Si pas de token, supprimer quand même les données et rediriger
        localStorage.clear(); // Nettoie tout le localStorage
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // En cas d'erreur, supprimer quand même les données et rediriger
      localStorage.clear(); // Nettoie tout le localStorage
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header
        title="Mon Profil"
        description="Statistiques et accomplissements"
      />

      {/* Indicateur de mode offline */}
      {isOfflineMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-medium">Mode hors ligne</p>
            <p className="text-yellow-700 text-sm">
              Services indisponibles, données par défaut affichées
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
        {/* Colonne principale */}
        <div className="flex flex-col gap-6">
          {/* Carte profil principale modernisée */}
          <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                  <Users className="w-4 h-4 text-blue-700" />
                </div>
                Informations personnelles
              </h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <Image
                    src={
                      userData.profileImage &&
                      userData.profileImage.trim() !== ""
                        ? userData.profileImage
                        : "/default-avatar.png"
                    }
                    alt="Photo de profil"
                    width={100}
                    height={100}
                    className="rounded-full border-3 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow hover:bg-blue-700 cursor-pointer"
                  >
                    <Edit size={14} className="text-white" />
                  </button>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {getRoleLabel(userData.role)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {userData.promotion}
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm">{userData.campus}</p>
                </div>
              </div>

              {/* Informations de contact modernisées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Mail size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Email
                      </p>
                      <p className="text-blue-900 font-semibold text-sm">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-200 rounded-lg">
                      <Phone size={18} className="text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-1">
                        Téléphone
                      </p>
                      <p className="text-green-900 font-semibold text-sm">
                        {userData.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques principales avec anneaux de progression */}
          <ProfileSection
            title="Statistiques principales"
            icon={TrendingUp}
            showDevelopmentBadge={true}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round((stats.totalHours / 1500) * 100)}
                  size={70}
                  color="#3B82F6"
                  label="Heures totales"
                />
                <p className="text-base sm:text-lg font-bold text-blue-900 mt-2">
                  {stats.totalHours}h
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round((stats.projectsCompleted / 30) * 100)}
                  size={70}
                  color="#10B981"
                  label="Projets terminés"
                />
                <p className="text-base sm:text-lg font-bold text-green-900 mt-2">
                  {stats.projectsCompleted}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round((stats.ectsCredits / 180) * 100)}
                  size={70}
                  color="#8B5CF6"
                  label="Crédits ECTS"
                />
                <p className="text-base sm:text-lg font-bold text-purple-900 mt-2">
                  {stats.ectsCredits}/180
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(stats.attendanceRate)}
                  size={70}
                  color="#F59E0B"
                  label="Taux de présence"
                />
                <p className="text-base sm:text-lg font-bold text-orange-900 mt-2">
                  {stats.attendanceRate}%
                </p>
              </div>
            </div>
          </ProfileSection>

          {/* Compétences avec radar chart */}
          <ProfileSection
            title="Compétences techniques"
            icon={Target}
            showDevelopmentBadge={true}
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                {stats.skills.length > 0 ? (
                  stats.skills.map((skill, index) => (
                    <SkillCard
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Aucune compétence enregistrée
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center">
                <RadarChart data={chartData.skillsRadar} size={250} />
              </div>
            </div>
          </ProfileSection>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Projets récents */}
          <ProfileSection
            title="Projets récents"
            icon={BookOpen}
            showDevelopmentBadge={true}
          >
            <div className="space-y-3">
              {stats.recentProjects.length > 0 ? (
                stats.recentProjects.map((project, index) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    grade={project.grade}
                    status={project.status}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun projet récent</p>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Médailles */}
          <ProfileSection
            title={`Badges (${stats.badges.filter((m) => m.obtained).length}/${
              stats.badges.length
            })`}
            icon={Badge}
            showDevelopmentBadge={true}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.badges.length > 0 ? (
                stats.badges.map((badge, index) => {
                  // Mapping des icônes FontAwesome
                  const getIcon = (iconName: string) => {
                    switch (iconName) {
                      case "faMedal":
                        return faMedal;
                      case "faCrown":
                        return faCrown;
                      case "faFire":
                        return faFire;
                      default:
                        return faMedal;
                    }
                  };

                  return (
                    <MedalCard
                      key={badge.name}
                      name={badge.name}
                      icon={getIcon(badge.icon)}
                      index={index}
                      obtained={badge.obtained}
                    />
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">Aucun badge disponible</p>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Actions rapides modernisées et compactes */}
          <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <h2 className="font-semibold text-lg text-green-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-green-200 to-green-300 rounded-lg">
                  <Target className="w-4 h-4 text-green-700" />
                </div>
                Actions rapides
              </h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => {
                    const editUrl =
                      userData.role === "admin" || userData.role === "advisor"
                        ? "/admin/profile/edit"
                        : "/profile/edit";
                    router.push(editUrl);
                  }}
                  className="w-full h-12 text-sm font-medium hover:scale-102 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm text-white cursor-pointer"
                  variant="default"
                >
                  <Edit className="w-4 h-4 mr-2 text-white" />
                  Modifier le profil
                </Button>
                <DevelopmentBadge>
                  <Button
                    className="w-full h-12 text-sm font-medium hover:scale-102 transition-transform duration-300 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm text-white cursor-pointer"
                    variant="default"
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-white" />
                    Exporter mes données
                  </Button>
                </DevelopmentBadge>
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 text-sm font-medium hover:scale-102 transition-transform duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm text-white cursor-pointer"
                  variant="default"
                >
                  <LogOut className="w-4 h-4 mr-2 text-white" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'upload d'image */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageChange={handleImageChange}
        currentImage={userData.profileImage}
      />
    </div>
  );
};

export default ProfilePage;
