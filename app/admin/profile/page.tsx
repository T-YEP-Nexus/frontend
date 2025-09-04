"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Target,
  BookOpen,
  Badge,
  Loader2,
  AlertCircle,
  ChevronDown,
  Search,
  User,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { faMedal, faCrown, faFire } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/Header/Header";
import SkillCard from "@/components/Profile/SkillCard";
import MedalCard from "@/components/Profile/MedalCard";
import ProjectCard from "@/components/Profile/ProjectCard";
import ProfileSection from "@/components/Profile/ProfileSection";
import ProgressRing from "@/components/Profile/ProgressRing";
import RadarChart from "@/components/Profile/RadarChart";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";
import usePromotionsData from "@/hooks/usePromotionsData";
import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminLoading from "@/components/admin/AdminLoading";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  promotion: string;
  campus: string;
  profileImage?: string;
  stats?: {
    totalHours: number;
    projectsCompleted: number;
    ectsCredits: number;
    attendanceRate: number;
    skills: Array<{ name: string; level: number }>;
    recentProjects: Array<{
      name: string;
      grade: number;
      status: "completed" | "in-progress" | "pending";
    }>;
    badges: Array<{ name: string; icon: string; obtained: boolean }>;
  };
  chartData?: {
    skillsRadar: Array<{ label: string; value: number }>;
  };
}

const AdminProfilePage = () => {
  const router = useRouter();
  const [showOtherUsers, setShowOtherUsers] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // États pour les statistiques rapides
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeProjects: 0,
    totalPromotions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const promotionDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Fonction pour nettoyer les paramètres URL
  const cleanUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("studentId");
    url.searchParams.delete("showOtherUsers");
    window.history.replaceState({}, "", url.toString());
  };

  // Gestion des paramètres URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("studentId");
    const showOtherUsersParam = urlParams.get("showOtherUsers");

    if (studentId && showOtherUsersParam === "true") {
      setShowOtherUsers(true);
      // Charger automatiquement le profil de l'étudiant
      loadStudentDirectly(studentId);
    }
  }, []);

  // Fonction pour récupérer les statistiques depuis les APIs
  const fetchStatsData = async () => {
    if (userRole !== "advisor") return; // Seulement pour les advisors

    try {
      setStatsLoading(true);

      // Récupérer tous les étudiants
      const studentsResponse = await fetch("http://localhost:3004/students", {
        credentials: "include",
      });
      const studentsData = studentsResponse.ok
        ? await studentsResponse.json()
        : { success: false, data: [] };

      // Récupérer tous les projets actifs
      const projectsResponse = await fetch(
        "http://localhost:3003/projects/active/list",
        {
          credentials: "include",
        }
      );
      const projectsData = projectsResponse.ok
        ? await projectsResponse.json()
        : { success: false, data: [] };

      // Récupérer toutes les promotions
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
      const totalStudents = studentsData.success ? studentsData.data.length : 0;
      const activeProjects = projectsData.success
        ? projectsData.data.length
        : 0;
      const totalPromotions = promotionsData.success
        ? promotionsData.data.length
        : 0;

      setStatsData({
        totalStudents,
        activeProjects,
        totalPromotions,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fonction pour traduire les rôles
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "advisor":
        return "Conseiller";
      case "student":
        return "Étudiant";
      default:
        return role;
    }
  };

  // Hook pour récupérer les promotions
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  // Récupérer le rôle de l'utilisateur connecté
  const { userData: currentUser, loading: userLoading } = useUserData(
    getUserIdFromToken()
  );

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Charger les statistiques quand le rôle est défini
  useEffect(() => {
    if (userRole === "advisor") {
      fetchStatsData();
    }
  }, [userRole]);

  // Vérifier les droits d'accès
  useEffect(() => {
    if (!userLoading && userRole && !["admin", "advisor"].includes(userRole)) {
      router.push("/dashboard?error=unauthorized");
    }
  }, [userRole, userLoading, router]);

  // Gestion du clic à l'extérieur pour fermer les dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promotionDropdownRef.current &&
        !promotionDropdownRef.current.contains(event.target as Node)
      ) {
        setPromotionDropdownOpen(false);
      }
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target as Node)
      ) {
        setStudentDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion de la sélection de promotion
  const handlePromotionSelect = (promotionName: string) => {
    setSelectedPromotion(promotionName);
    setSelectedStudent("");
    setStudentData(null);
    setPromotionDropdownOpen(false);
    cleanUrlParams(); // Nettoyer les paramètres URL
  };

  // Gestion du bouton pour voir les autres utilisateurs
  const handleShowOtherUsers = () => {
    setShowOtherUsers(true);
    setSelectedPromotion("");
    setSelectedStudent("");
    setStudentData(null);
    cleanUrlParams(); // Nettoyer les paramètres URL
  };

  // Gestion du retour au profil admin
  const handleBackToAdminProfile = () => {
    setShowOtherUsers(false);
    setSelectedPromotion("");
    setSelectedStudent("");
    setStudentData(null);
    cleanUrlParams(); // Nettoyer les paramètres URL
  };

  // Gestion de la déconnexion
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
          credentials: "include",
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

  // État pour les étudiants récupérés depuis la BDD
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Fonction pour récupérer les étudiants d'une promotion
  const fetchStudentsForPromotion = async (promotionName: string) => {
    if (!promotionName) {
      setStudents([]);
      return;
    }

    try {
      setStudentsLoading(true);
      setError(null);

      // Trouver l'ID de la promotion sélectionnée
      const selectedPromotionData = promotions?.find(
        (p) => p.name === promotionName
      );
      if (!selectedPromotionData) {
        throw new Error("Promotion non trouvée");
      }

      console.log("Promotion sélectionnée:", selectedPromotionData);

      // Utiliser la nouvelle route pour récupérer les étudiants par promotion
      const studentsResponse = await fetch(
        `http://localhost:3004/students/promotion/${selectedPromotionData.id}`,
        {
          credentials: "include",
        }
      );
      if (!studentsResponse.ok) {
        const errorText = await studentsResponse.text();
        console.error("Erreur API:", studentsResponse.status, errorText);
        throw new Error(
          `Erreur lors de la récupération des étudiants (${studentsResponse.status}): ${errorText}`
        );
      }
      const studentsData = await studentsResponse.json();

      if (!studentsData.success) {
        throw new Error(studentsData.message || "Erreur serveur");
      }

      console.log("Étudiants récupérés:", studentsData.data);

      // Utiliser les données brutes retournées par l'API (même format que la page projet)
      // afin d'afficher les noms via student.profile.first_name/last_name
      setStudents(Array.isArray(studentsData.data) ? studentsData.data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des étudiants:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Charger les étudiants quand une promotion est sélectionnée
  useEffect(() => {
    if (selectedPromotion) {
      fetchStudentsForPromotion(selectedPromotion);
    } else {
      setStudents([]);
    }
  }, [selectedPromotion]);
  const filteredStudents = students.filter((student: any) => {
    const firstName = student?.profile?.first_name || student?.first_name || "";
    const lastName = student?.profile?.last_name || student?.last_name || "";
    const email = student?.profile?.email || student?.email || "";
    return `${firstName} ${lastName} ${email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // Gestion de la sélection d'étudiant
  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudent(studentId);
    setStudentDropdownOpen(false);
    setLoadingStudent(true);
    setError(null);
    cleanUrlParams();
    await loadStudentDirectly(studentId);
  };

  // Nouvelle fonction pour charger un étudiant directement depuis l'API
  const loadStudentDirectly = async (studentId: string) => {
    setSelectedStudent(studentId);
    setLoadingStudent(true);
    setError(null);

    try {
      // Récupérer les données complètes du profil étudiant
      const profileResponse = await fetch(
        `http://localhost:3004/profile/${studentId}`,
        {
          credentials: "include",
        }
      );
      if (!profileResponse.ok) {
        throw new Error("Erreur lors de la récupération du profil");
      }
      const profileData = await profileResponse.json();

      if (!profileData.success) {
        throw new Error(profileData.message || "Erreur serveur");
      }

      // Récupérer les données étudiant spécifiques
      const studentResponse = await fetch(
        `http://localhost:3004/student/profile/${studentId}`,
        {
          credentials: "include",
        }
      );
      const studentData = studentResponse.ok
        ? await studentResponse.json()
        : { success: false, data: null };

      // Récupérer les données utilisateur pour l'email
      const userResponse = await fetch(
        `http://localhost:3001/users/${profileData.data.id_user}`,
        {
          credentials: "include",
        }
      );
      const userData = userResponse.ok
        ? await userResponse.json()
        : { success: false, data: null };

      // Récupérer la promotion depuis l'API des promotions
      let promotionName = "Non spécifiée";
      if (studentData.success && studentData.data.id_promotion) {
        try {
          // Récupérer toutes les promotions
          const promotionsResponse = await fetch(
            "http://localhost:3004/promotions",
            {
              credentials: "include",
            }
          );
          if (promotionsResponse.ok) {
            const promotionsData = await promotionsResponse.json();

            if (promotionsData.success) {
              // Fonction pour récupérer le nom de promotion par ID
              const getPromotionNameById = (promotionId: string): string => {
                if (!promotionsData.success || !promotionId) return "";
                const promotion = promotionsData.data.find(
                  (p: { id: string; name: string }) => p.id === promotionId
                );
                console.log(
                  "Recherche promotion pour ID:",
                  promotionId,
                  "Résultat:",
                  promotion
                );
                return promotion ? promotion.name : "";
              };

              // Convertir l'ID de promotion en nom
              const promotionId = studentData.data.id_promotion;
              console.log("ID promotion à convertir:", promotionId);
              promotionName = getPromotionNameById(promotionId);
              console.log("Nom de promotion trouvé:", promotionName);
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de la promotion:",
            error
          );
        }
      }

      // Construire l'objet Student avec les vraies données
      const studentProfile: Student = {
        id: profileData.data.id,
        firstName: profileData.data.first_name,
        lastName: profileData.data.last_name,
        email: userData.success
          ? userData.data.email
          : profileData.data.email || "",
        phone: profileData.data.phone || "",
        role: "student",
        promotion: promotionName,
        campus: profileData.data.campus || "Non spécifié",
        profileImage: profileData.data.profileImage || "/default-avatar.png",
        stats: {
          totalHours: Math.floor(Math.random() * 2000) + 500, // Données simulées
          projectsCompleted: Math.floor(Math.random() * 20) + 5,
          ectsCredits: Math.floor(Math.random() * 180) + 60,
          attendanceRate: Math.floor(Math.random() * 30) + 70,
          skills: [
            { name: "React", level: Math.floor(Math.random() * 40) + 60 },
            { name: "Node.js", level: Math.floor(Math.random() * 40) + 60 },
            { name: "Python", level: Math.floor(Math.random() * 40) + 60 },
            { name: "Docker", level: Math.floor(Math.random() * 40) + 60 },
            { name: "TypeScript", level: Math.floor(Math.random() * 40) + 60 },
          ],
          recentProjects: [
            {
              name: "Projet Web",
              grade: Math.floor(Math.random() * 30) + 70,
              status: "completed",
            },
            {
              name: "API REST",
              grade: Math.floor(Math.random() * 30) + 70,
              status: "completed",
            },
            {
              name: "Application Mobile",
              grade: Math.floor(Math.random() * 30) + 70,
              status: "in-progress",
            },
          ],
          badges: [
            { name: "Premier commit", icon: "faMedal", obtained: true },
            { name: "Architecture validée", icon: "faCrown", obtained: true },
            {
              name: "Projet terminé",
              icon: "faFire",
              obtained: Math.random() > 0.5,
            },
            { name: "Mentor", icon: "faMedal", obtained: Math.random() > 0.5 },
          ],
        },
        chartData: {
          skillsRadar: [
            { label: "React", value: Math.floor(Math.random() * 40) + 60 },
            { label: "Node.js", value: Math.floor(Math.random() * 40) + 60 },
            { label: "Python", value: Math.floor(Math.random() * 40) + 60 },
            { label: "Docker", value: Math.floor(Math.random() * 40) + 60 },
            { label: "TypeScript", value: Math.floor(Math.random() * 40) + 60 },
          ],
        },
      };

      setStudentData(studentProfile);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'étudiant:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingStudent(false);
    }
  };

  // Affichage du loading utilisateur
  if (userLoading) {
    return <AdminLoading message="Vérification des droits d'accès..." />;
  }

  // Vérification des droits
  if (!userRole || !["admin", "advisor"].includes(userRole)) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <Header
        title={showOtherUsers ? "Profil Étudiant" : "Mon Profil"}
        description={
          showOtherUsers
            ? "Consulter le profil d'un étudiant"
            : "Statistiques et accomplissements"
        }
      />

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 hover:bg-red-100 transition-colors duration-300 cursor-default">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Affichage du profil admin par défaut */}
      {!showOtherUsers && currentUser && (
        <>
          {/* Statistiques rapides - visible seulement pour les advisors (pleine largeur) */}
          {userRole === "advisor" && (
            <div className="mb-6 bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-700" />
                  </div>
                  Statistiques rapides
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    {statsLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-blue-900">
                        {statsData.totalStudents}
                      </div>
                    )}
                    <div className="text-sm text-blue-600">Étudiants</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    {statsLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-blue-900">
                        {statsData.activeProjects}
                      </div>
                    )}
                    <div className="text-sm text-blue-600">Projets actifs</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    {statsLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-blue-900">
                        {statsData.totalPromotions}
                      </div>
                    )}
                    <div className="text-sm text-blue-600">Promotions</div>
                  </div>
                  {/* <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-900">24</div>
                    <div className="text-sm text-blue-600">
                      Heures cette semaine
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-x-8 gap-y-6 items-start">
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
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="relative">
                      <Image
                        src={
                          currentUser.profileImage &&
                          currentUser.profileImage.trim() !== ""
                            ? currentUser.profileImage
                            : "/default-avatar.png"
                        }
                        alt="Photo de profil"
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-bold text-blue-900 mb-3">
                        {currentUser.firstName} {currentUser.lastName}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {getRoleLabel(currentUser.role)}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {currentUser.campus}
                        </span>
                      </div>
                      <p className="text-blue-600 text-base">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Informations de contact modernisées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-200 rounded-lg">
                          <GraduationCap size={20} className="text-blue-700" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium mb-2">
                            Email
                          </p>
                          <p className="text-blue-900 font-semibold text-base">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-200 rounded-lg">
                          <Users size={20} className="text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium mb-2">
                            Téléphone
                          </p>
                          <p className="text-green-900 font-semibold text-base">
                            {currentUser.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section supplémentaire pour équilibrer la hauteur */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <User size={16} className="text-gray-700" />
                      </div>
                      Aperçu du profil
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Bienvenue dans votre espace personnel. Vous pouvez
                      consulter vos informations, modifier votre profil ou
                      accéder aux fonctionnalités de gestion selon votre rôle.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite modernisée */}
            <div className="flex flex-col gap-4">
              {/* Informations système modernisées */}
              <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                      <User className="w-4 h-4 text-blue-700" />
                    </div>
                    Informations système
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <User size={16} className="text-blue-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                          Rôle
                        </h4>
                        <p className="text-blue-700 font-medium text-sm">
                          {getRoleLabel(currentUser.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <GraduationCap size={16} className="text-blue-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                          Campus
                        </h4>
                        <p className="text-blue-700 font-medium text-sm">
                          {currentUser.campus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides modernisées et compactes */}
              <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                      <Target className="w-4 h-4 text-blue-700" />
                    </div>
                    Actions rapides
                  </h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <AdminButton
                      onClick={handleShowOtherUsers}
                      className="w-full h-12 text-sm font-medium hover:scale-102 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Consulter les profils étudiants
                    </AdminButton>
                    <Button
                      onClick={() => router.push("/profile/edit")}
                      className="w-full h-12 text-sm font-medium hover:scale-102 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm text-white cursor-pointer"
                      variant="default"
                    >
                      <User className="w-4 h-4 mr-2 text-white" />
                      Modifier mon profil
                    </Button>
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
        </>
      )}

      {/* Sélecteurs de promotion et étudiant */}
      {showOtherUsers && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 mb-8 ">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <div className="flex max-lg:flex-col max-lg:gap-4 items-center justify-between">
              <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
                  <User className="w-6 h-6 text-blue-700" />
                </div>
                Sélection de l'étudiant
              </h2>
              <AdminButton
                onClick={handleBackToAdminProfile}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Retour à mon profil
              </AdminButton>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Sélection de promotion */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-blue-900">
                Promotion *
              </label>
              <div className="relative" ref={promotionDropdownRef}>
                <div
                  onClick={() => {
                    if (
                      !promotionDropdownOpen &&
                      promotionDropdownRef.current
                    ) {
                      const rect =
                        promotionDropdownRef.current.getBoundingClientRect();
                      const dropdownHeight = 200; // Hauteur approximative de la dropdown
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const spaceAbove = rect.top;

                      // Si il y a plus d'espace en haut qu'en bas, ouvrir au-dessus
                      const shouldOpenAbove =
                        spaceAbove > spaceBelow && spaceAbove > dropdownHeight;

                      setDropdownPosition({
                        top: shouldOpenAbove
                          ? rect.top - dropdownHeight - 5
                          : rect.bottom + 5,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                    setPromotionDropdownOpen(!promotionDropdownOpen);
                  }}
                  className="flex items-center justify-between px-4 py-3 border-2 border-blue-200 rounded-xl bg-white cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg"
                >
                  <span
                    className={
                      promotionsLoading
                        ? "text-blue-400"
                        : selectedPromotion
                        ? "text-blue-900 font-medium"
                        : "text-blue-400"
                    }
                  >
                    {promotionsLoading
                      ? "Chargement des promotions..."
                      : selectedPromotion || "Sélectionner une promotion"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-blue-400 transition-transform duration-300 ${
                      promotionDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {promotionDropdownOpen && !promotionsLoading && promotions && (
                  <div
                    className="fixed z-50 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-[200px] overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                    }}
                  >
                    {promotions.map((promotion) => (
                      <div
                        key={promotion.id}
                        onClick={() => handlePromotionSelect(promotion.name)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <GraduationCap
                              className="text-blue-600"
                              size={16}
                            />
                          </div>
                          <span className="text-blue-900 font-medium">
                            {promotion.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {promotionsError && (
                <p className="text-red-600 text-sm mt-1">
                  Erreur lors du chargement des promotions: {promotionsError}
                </p>
              )}
            </div>

            {/* Sélection d'étudiant */}
            {selectedPromotion && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-blue-900">
                  Étudiant *
                </label>

                <div className="relative" ref={studentDropdownRef}>
                  <div
                    onClick={() => {
                      if (!studentDropdownOpen && studentDropdownRef.current) {
                        const rect =
                          studentDropdownRef.current.getBoundingClientRect();
                        const dropdownHeight = 300; // Hauteur approximative de la dropdown
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;

                        // Si il y a plus d'espace en haut qu'en bas, ouvrir au-dessus
                        const shouldOpenAbove =
                          spaceAbove > spaceBelow &&
                          spaceAbove > dropdownHeight;

                        setDropdownPosition({
                          top: shouldOpenAbove
                            ? rect.top - dropdownHeight - 5
                            : rect.bottom + 5,
                          left: rect.left,
                          width: rect.width,
                        });
                      }
                      setStudentDropdownOpen(!studentDropdownOpen);
                    }}
                    className="flex items-center justify-between px-4 py-3 border-2 border-blue-200 rounded-xl bg-white cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg"
                  >
                    <span
                      className={
                        selectedStudent
                          ? "text-blue-900 font-medium"
                          : "text-blue-400"
                      }
                    >
                      {selectedStudent
                        ? students.find((s) => s.id === selectedStudent)
                            ?.firstName +
                          " " +
                          students.find((s) => s.id === selectedStudent)
                            ?.lastName
                        : "Sélectionner un étudiant"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-blue-400 transition-transform duration-300 ${
                        studentDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {studentDropdownOpen && (
                    <div
                      className="fixed z-50 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-[300px] overflow-hidden"
                      style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                      }}
                    >
                      {/* Barre de recherche */}
                      <div className="p-4 border-b border-blue-100">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                            size={16}
                          />
                          <input
                            type="text"
                            placeholder="Rechercher un étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {/* Liste des étudiants */}
                      <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                        {studentsLoading ? (
                          <div className="px-4 py-3 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-600" />
                            <p className="text-sm text-blue-600 mt-1">
                              Chargement...
                            </p>
                          </div>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => handleStudentSelect(student.id)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <User className="text-blue-600" size={16} />
                                </div>
                                <div className="flex-1">
                                  <span className="text-blue-900 font-medium">
                                    {student.firstName} {student.lastName}
                                  </span>
                                  <p className="text-xs text-blue-600">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-sm text-blue-600">
                            {selectedPromotion
                              ? "Aucun étudiant trouvé dans cette promotion"
                              : "Sélectionnez d'abord une promotion"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affichage du profil de l'étudiant */}
      {loadingStudent && (
        <div className="flex items-center justify-center h-64">
          <AdminLoading message="Chargement du profil étudiant..." />
        </div>
      )}

      {studentData && !loadingStudent && (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
          {/* Colonne principale */}
          <div className="flex flex-col gap-6">
            {/* Carte profil principale */}
            <ProfileSection title="Informations personnelles" icon={Users}>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-3xl font-bold">
                      {studentData.firstName.charAt(0).toUpperCase()}
                      {studentData.lastName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    {studentData.firstName} {studentData.lastName}
                  </h2>
                  <p className="text-blue-800/80 mb-1">
                    Étudiant - {studentData.promotion}
                  </p>
                  <p className="text-blue-700/70 text-sm">
                    {studentData.campus}
                  </p>
                </div>
              </div>

              {/* Informations complètes de l'étudiant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Email */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <GraduationCap size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Email
                      </p>
                      <p className="text-blue-900 font-semibold text-sm">
                        {studentData.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Users size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Téléphone
                      </p>
                      <p className="text-blue-900 font-semibold text-sm">
                        {studentData.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promotion */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <GraduationCap size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Promotion
                      </p>
                      <p className="text-blue-900 font-semibold text-sm">
                        {studentData.promotion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Users size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        ID
                      </p>
                      <p className="text-blue-900 font-semibold text-sm">
                        {studentData.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSection>

            {/* Statistiques principales avec anneaux de progression */}
            <ProfileSection
              title="Statistiques principales"
              icon={TrendingUp}
              showDevelopmentBadge={true}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <ProgressRing
                    progress={Math.round(
                      (studentData.stats!.totalHours / 1500) * 100
                    )}
                    size={70}
                    color="#3B82F6"
                    label="Heures totales"
                  />
                  <p className="text-base sm:text-lg font-bold text-blue-900 mt-2">
                    {studentData.stats!.totalHours}h
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    progress={Math.round(
                      (studentData.stats!.projectsCompleted / 30) * 100
                    )}
                    size={70}
                    color="#10B981"
                    label="Projets terminés"
                  />
                  <p className="text-base sm:text-lg font-bold text-green-900 mt-2">
                    {studentData.stats!.projectsCompleted}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    progress={Math.round(
                      (studentData.stats!.ectsCredits / 180) * 100
                    )}
                    size={70}
                    color="#8B5CF6"
                    label="Crédits ECTS"
                  />
                  <p className="text-base sm:text-lg font-bold text-purple-900 mt-2">
                    {studentData.stats!.ectsCredits}/180
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    progress={Math.round(studentData.stats!.attendanceRate)}
                    size={70}
                    color="#F59E0B"
                    label="Taux de présence"
                  />
                  <p className="text-base sm:text-lg font-bold text-orange-900 mt-2">
                    {studentData.stats!.attendanceRate}%
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
                  {studentData.stats!.skills.length > 0 ? (
                    studentData.stats!.skills.map((skill, index) => (
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
                  <RadarChart
                    data={studentData.chartData!.skillsRadar}
                    size={250}
                  />
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
                {studentData.stats!.recentProjects.length > 0 ? (
                  studentData.stats!.recentProjects.map((project, index) => (
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
              title={`Badges (${
                studentData.stats!.badges.filter((m) => m.obtained).length
              }/${studentData.stats!.badges.length})`}
              icon={Badge}
              showDevelopmentBadge={true}
            >
              <div className="grid grid-cols-2 gap-4">
                {studentData.stats!.badges.length > 0 ? (
                  studentData.stats!.badges.map((badge, index) => {
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

            {/* Actions rapides */}
            <ProfileSection title="Actions rapides">
              <div className="space-y-3">
                <AdminButton
                  onClick={() =>
                    router.push(`/admin/users/edit/${studentData.id}`)
                  }
                  className="w-full"
                >
                  Modifier le profil
                </AdminButton>
                <DevelopmentBadge>
                  <Button
                    className="w-full !border-blue-600 !text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 cursor-pointer flex items-center gap-2"
                    variant="outline"
                  >
                    Exporter les données
                  </Button>
                </DevelopmentBadge>
                <DevelopmentBadge>
                  <Button
                    className="w-full !border-green-600 !text-green-600 hover:!bg-green-50 hover:!text-green-700 cursor-pointer flex items-center gap-2"
                    variant="outline"
                  >
                    Voir les projets
                  </Button>
                </DevelopmentBadge>
              </div>
            </ProfileSection>
          </div>
        </div>
      )}

      {/* Message si aucune sélection */}
      {showOtherUsers && !selectedPromotion && !loadingStudent && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">
              Sélectionnez une promotion et un étudiant
            </p>
            <p className="text-white/80 text-sm">
              Pour consulter le profil d'un étudiant
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
