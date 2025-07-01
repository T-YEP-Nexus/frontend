"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LogOut,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal, faCrown, faFire } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/Header/Header";
import {
  StatCard,
  SkillCard,
  MedalCard,
  ProjectCard,
  ProfileSection,
  ProgressRing,
  BarChart,
  RadarChart,
  PieChart,
  ImageUploadModal,
} from "@/components/Profile";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  // État pour l'image de profil
  const [profileImage, setProfileImage] = useState("/images/Avatar.png");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Données fictives pour l'exemple
  const userStats = {
    totalHours: 1247,
    projectsCompleted: 23,
    averageGrade: 16.8,
    attendanceRate: 94.5,
    skills: [
      { name: "React", level: 85, color: "bg-blue-500" },
      { name: "Node.js", level: 78, color: "bg-green-500" },
      { name: "Python", level: 92, color: "bg-yellow-500" },
      { name: "TypeScript", level: 88, color: "bg-purple-500" },
      { name: "Docker", level: 75, color: "bg-blue-600" },
      { name: "AWS", level: 70, color: "bg-orange-500" },
    ],
    medals: [
      {
        name: "Premier Projet",
        icon: faMedal,
        color: "text-yellow-500",
        obtained: true,
      },
      {
        name: "100h de Code",
        icon: faFire,
        color: "text-orange-500",
        obtained: true,
      },
      {
        name: "Excellence",
        icon: faCrown,
        color: "text-purple-500",
        obtained: true,
      },
      {
        name: "Team Player",
        icon: faMedal,
        color: "text-blue-500",
        obtained: false,
      },
      {
        name: "Innovation",
        icon: faFire,
        color: "text-red-500",
        obtained: true,
      },
      {
        name: "Mentor",
        icon: faCrown,
        color: "text-green-500",
        obtained: false,
      },
    ],
    recentProjects: [
      { name: "T-DEV-500", grade: 18, status: "completed" as const },
      { name: "T-YOP-700", grade: 16, status: "completed" as const },
      { name: "T-SEN-700", grade: 17, status: "in-progress" as const },
      { name: "T-CEN-100", grade: null, status: "pending" as const },
    ],
  };

  // Données pour les diagrammes
  const chartData = {
    // Données pour le graphique en barres des heures par mois
    monthlyHours: [
      { label: "Jan", value: 120, color: "#3B82F6" },
      { label: "Fév", value: 95, color: "#10B981" },
      { label: "Mar", value: 140, color: "#F59E0B" },
      { label: "Avr", value: 110, color: "#8B5CF6" },
      { label: "Mai", value: 160, color: "#EF4444" },
      { label: "Juin", value: 135, color: "#06B6D4" },
    ],
    // Données pour le radar chart des compétences
    skillsRadar: userStats.skills.map((skill) => ({
      label: skill.name,
      value: skill.level,
    })),
    // Données pour le pie chart des projets
    projectsPie: [
      { label: "Terminés", value: 18, color: "#10B981" },
      { label: "En cours", value: 3, color: "#3B82F6" },
      { label: "En attente", value: 2, color: "#6B7280" },
    ],
  };

  const handleImageChange = (newImageUrl: string) => {
    setProfileImage(newImageUrl);
  };

  const router = useRouter();


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
                  src={profileImage}
                  alt="Photo de profil"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-200 shadow-lg"
                />
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow hover:bg-blue-700"
                >
                  <Edit size={16} className="text-white" />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  Valentin Dupont
                </h2>
                <p className="text-blue-800/80 mb-1">
                  Étudiant Epitech - Promotion 2024
                </p>
                <p className="text-blue-700/70 text-sm">Campus Paris</p>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800/60">Email</p>
                  <p className="text-blue-900 font-medium">
                    valentin.dupont@epitech.eu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800/60">Téléphone</p>
                  <p className="text-blue-900 font-medium">+33 6 12 34 56 78</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800/60">Campus</p>
                  <p className="text-blue-900 font-medium">Epitech Paris</p>
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Statistiques principales avec anneaux de progression */}
          <ProfileSection title="Statistiques principales" icon={TrendingUp}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round((userStats.totalHours / 1500) * 100)}
                  size={70}
                  color="#3B82F6"
                  label="Heures totales"
                />
                <p className="text-base sm:text-lg font-bold text-blue-900 mt-2">
                  {userStats.totalHours}h
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(
                    (userStats.projectsCompleted / 30) * 100
                  )}
                  size={70}
                  color="#10B981"
                  label="Projets terminés"
                />
                <p className="text-base sm:text-lg font-bold text-green-900 mt-2">
                  {userStats.projectsCompleted}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round((userStats.averageGrade / 20) * 100)}
                  size={70}
                  color="#8B5CF6"
                  label="Note moyenne"
                />
                <p className="text-base sm:text-lg font-bold text-purple-900 mt-2">
                  {userStats.averageGrade}/20
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={Math.round(userStats.attendanceRate)}
                  size={70}
                  color="#F59E0B"
                  label="Taux de présence"
                />
                <p className="text-base sm:text-lg font-bold text-orange-900 mt-2">
                  {userStats.attendanceRate}%
                </p>
              </div>
            </div>
          </ProfileSection>

          {/* Compétences avec radar chart */}
          <ProfileSection title="Compétences techniques" icon={Target}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                {userStats.skills.map((skill, index) => (
                  <SkillCard
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    color={skill.color}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center">
                <RadarChart data={chartData.skillsRadar} size={250} />
              </div>
            </div>
          </ProfileSection>

          {/* Projets récents */}
          <ProfileSection title="Projets récents" icon={BookOpen}>
            <div className="space-y-3">
              {userStats.recentProjects.map((project, index) => (
                <ProjectCard
                  key={project.name}
                  name={project.name}
                  grade={project.grade}
                  status={project.status}
                />
              ))}
            </div>
          </ProfileSection>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Médailles */}
          <ProfileSection
            title={`Médailles (${
              userStats.medals.filter((m) => m.obtained).length
            }/${userStats.medals.length})`}
            icon={Trophy}
          >
            <div className="grid grid-cols-2 gap-4">
              {userStats.medals.map((medal, index) => (
                <MedalCard
                  key={medal.name}
                  name={medal.name}
                  icon={medal.icon}
                  color={medal.color}
                  obtained={medal.obtained}
                />
              ))}
            </div>
          </ProfileSection>

          {/* Répartition des projets */}
          <ProfileSection title="Répartition des projets" icon={PieChartIcon}>
            <PieChart data={chartData.projectsPie} size={150} />
          </ProfileSection>

          {/* Objectifs */}
          <ProfileSection title="Objectifs" icon={Target}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-blue-900">
                  1500h de code (1247/1500)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-900">
                  30 projets terminés (23/30)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-500">
                  Médaille Mentor (0/1)
                </span>
              </div>
            </div>
          </ProfileSection>

          {/* Actions rapides */}
          <ProfileSection title="Actions rapides">
            <div className="space-y-3">
              <Button
                className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white cursor-pointer"
                variant="default"
              >
                Modifier le profil
              </Button>
              <Button
                className="w-full !border-blue-600 !text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 cursor-pointer"
                variant="outline"
              >
                Changer le mot de passe
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
        currentImage={profileImage}
      />
    </div>
  );
};

export default ProfilePage;
