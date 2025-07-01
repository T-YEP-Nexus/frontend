"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

const ProfilePage = () => {
  const router = useRouter();

  // État pour le modal d'image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Hook pour les données utilisateur
  const { userData, loading, error, updateProfileImageUrl } = useUserData();

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
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error || !userData) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Erreur lors du chargement du profil
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Supprimer les données du localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de login
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header
        title="Mon Profil"
        description="Statistiques et accomplissements"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
        {/* Colonne principale */}
        <div className="flex flex-col gap-6">
          {/* Carte profil principale */}
          <ProfileSection title="Informations personnelles" icon={Users}>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="relative">
                <Image
                  src={userData.profileImage}
                  alt="Photo de profil"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-200 shadow-lg"
                />
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow hover:bg-blue-700 cursor-pointer"
                >
                  <Edit size={16} className="text-white" />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-blue-800/80 mb-1">
                  {userData.role} - {userData.promotion}
                </p>
                <p className="text-blue-700/70 text-sm">{userData.campus}</p>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="flex w-full justify-around">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800/60">Email</p>
                  <p className="text-blue-900 font-medium">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800/60">Téléphone</p>
                  <p className="text-blue-900 font-medium">{userData.phone}</p>
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Statistiques principales avec anneaux de progression */}
          <ProfileSection title="Statistiques principales" icon={TrendingUp}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(
                    (userData.stats.totalHours / 1500) * 100
                  )}
                  size={70}
                  color="#3B82F6"
                  label="Heures totales"
                />
                <p className="text-base sm:text-lg font-bold text-blue-900 mt-2">
                  {userData.stats.totalHours}h
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(
                    (userData.stats.projectsCompleted / 30) * 100
                  )}
                  size={70}
                  color="#10B981"
                  label="Projets terminés"
                />
                <p className="text-base sm:text-lg font-bold text-green-900 mt-2">
                  {userData.stats.projectsCompleted}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(
                    (userData.stats.ectsCredits / 180) * 100
                  )}
                  size={70}
                  color="#8B5CF6"
                  label="Crédits ECTS"
                />
                <p className="text-base sm:text-lg font-bold text-purple-900 mt-2">
                  {userData.stats.ectsCredits}/180
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(userData.stats.attendanceRate)}
                  size={70}
                  color="#F59E0B"
                  label="Taux de présence"
                />
                <p className="text-base sm:text-lg font-bold text-orange-900 mt-2">
                  {userData.stats.attendanceRate}%
                </p>
              </div>
            </div>
          </ProfileSection>

          {/* Compétences avec radar chart */}
          <ProfileSection title="Compétences techniques" icon={Target}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                {userData.stats.skills.map((skill, index) => (
                  <SkillCard
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    index={index}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center">
                <RadarChart data={userData.chartData.skillsRadar} size={250} />
              </div>
            </div>
          </ProfileSection>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Projets récents */}
          <ProfileSection title="Projets récents" icon={BookOpen}>
            <div className="space-y-3">
              {userData.stats.recentProjects.map((project, index) => (
                <ProjectCard
                  key={project.name}
                  name={project.name}
                  grade={project.grade}
                  status={project.status}
                />
              ))}
            </div>
          </ProfileSection>

          {/* Médailles */}
          <ProfileSection
            title={`Badges (${
              userData.stats.badges.filter((m) => m.obtained).length
            }/${userData.stats.badges.length})`}
            icon={Badge}
          >
            <div className="grid grid-cols-2 gap-4">
              {userData.stats.badges.map((badge, index) => {
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
              })}
            </div>
          </ProfileSection>

          {/* Actions rapides */}
          <ProfileSection title="Actions rapides">
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/profile/edit")}
                className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white cursor-pointer"
                variant="default"
              >
                Modifier le profil
              </Button>
              <Button
                className="w-full !border-blue-600 !text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 cursor-pointer"
                variant="outline"
              >
                Exporter mes données
              </Button>
              <Button
                onClick={handleLogout}
                className="w-full !border-red-600 !text-red-600 hover:!bg-red-50 hover:!text-red-700 cursor-pointer"
                variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </ProfileSection>
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
