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

  const promotionDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

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
  };

  // Gestion du bouton pour voir les autres utilisateurs
  const handleShowOtherUsers = () => {
    setShowOtherUsers(true);
    setSelectedPromotion("");
    setSelectedStudent("");
    setStudentData(null);
  };

  // Gestion du retour au profil admin
  const handleBackToAdminProfile = () => {
    setShowOtherUsers(false);
    setSelectedPromotion("");
    setSelectedStudent("");
    setStudentData(null);
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
  const [students, setStudents] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      campus: string;
      promotion: string;
      major: string;
      student_number: string;
    }>
  >([]);
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
        `http://localhost:3004/students/promotion/${selectedPromotionData.id}`
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

      // Récupérer les profils utilisateurs pour les étudiants trouvés
      const studentIds = studentsData.data.map(
        (student: any) => student.id_user_profile
      );

      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Récupérer les profils utilisateurs
      const profilesResponse = await fetch("http://localhost:3004/profiles");
      if (!profilesResponse.ok) {
        throw new Error("Erreur lors de la récupération des profils");
      }
      const profilesData = await profilesResponse.json();

      if (!profilesData.success) {
        throw new Error(profilesData.message || "Erreur serveur");
      }

      // Récupérer tous les utilisateurs pour avoir les emails
      const usersResponse = await fetch("http://localhost:3001/users");
      const usersData = usersResponse.ok
        ? await usersResponse.json()
        : { success: false, data: [] };

      // Combiner les données
      const studentsWithProfiles = studentsData.data
        .map((student: any) => {
          const profile = profilesData.data.find(
            (p: any) => p.id === student.id_user_profile
          );

          if (!profile) {
            return null;
          }

          // Récupérer l'email depuis la table user
          const user = usersData.success
            ? usersData.data.find((u: any) => u.id === profile.id_user)
            : null;

          return {
            id: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: user ? user.email : profile.email,
            phone: profile.phone,
            campus: profile.campus,
            promotion: promotionName,
            major: student.major,
            student_number: student.student_number,
          };
        })
        .filter(Boolean);

      setStudents(studentsWithProfiles);
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
  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Gestion de la sélection d'étudiant
  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudent(studentId);
    setStudentDropdownOpen(false);
    setLoadingStudent(true);
    setError(null);

    try {
      // Récupérer les données de l'étudiant depuis la BDD
      const selectedStudentData = students.find((s) => s.id === studentId);

      if (!selectedStudentData) {
        throw new Error("Étudiant non trouvé");
      }

      // Récupérer les données complètes du profil étudiant
      const profileResponse = await fetch(
        `http://localhost:3004/profile/${studentId}`
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
        `http://localhost:3004/student/profile/${studentId}`
      );
      const studentData = studentResponse.ok
        ? await studentResponse.json()
        : { success: false, data: null };

      // Construire l'objet Student avec les vraies données
      const studentProfile: Student = {
        id: selectedStudentData.id,
        firstName: selectedStudentData.firstName,
        lastName: selectedStudentData.lastName,
        email: selectedStudentData.email,
        phone: selectedStudentData.phone,
        role: "student",
        promotion: selectedStudentData.promotion,
        campus: selectedStudentData.campus,
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
                        currentUser.profileImage &&
                        currentUser.profileImage.trim() !== ""
                          ? currentUser.profileImage
                          : "/default-avatar.png"
                      }
                      alt="Photo de profil"
                      width={100}
                      height={100}
                      className="rounded-full border-3 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">
                      {currentUser.firstName} {currentUser.lastName}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {currentUser.role}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {currentUser.campus}
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm">{currentUser.email}</p>
                  </div>
                </div>

                {/* Informations de contact modernisées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Users size={18} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">
                          Téléphone
                        </p>
                        <p className="text-green-900 font-semibold text-sm">
                          {currentUser.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-700" />
                  </div>
                  Statistiques rapides
                </h2>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">12</div>
                    <div className="text-xs text-blue-600">Étudiants gérés</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">8</div>
                    <div className="text-xs text-blue-600">Projets actifs</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">3</div>
                    <div className="text-xs text-blue-600">
                      Promotions gérées
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">24</div>
                    <div className="text-xs text-blue-600">
                      Heures cette semaine
                    </div>
                  </div>
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
                        {currentUser.role}
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
                    onClick={() => router.push("/admin/profile/edit")}
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
      )}

      {/* Sélecteurs de promotion et étudiant */}
      {showOtherUsers && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 mb-8 ">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <div className="flex items-center justify-between">
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
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !promotionDropdownOpen &&
                      promotionDropdownRef.current
                    ) {
                      const rect =
                        promotionDropdownRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 5,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                    setPromotionDropdownOpen(!promotionDropdownOpen);
                  }}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer flex items-center justify-between"
                  disabled={promotionsLoading}
                >
                  <span
                    className={
                      selectedPromotion ? "text-blue-900" : "text-white"
                    }
                  >
                    {promotionsLoading
                      ? "Chargement des promotions..."
                      : selectedPromotion || "Sélectionnez une promotion"}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-blue-400 transition-transform duration-300 ${
                      promotionDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {promotionDropdownOpen && !promotionsLoading && promotions && (
                  <div
                    className="fixed z-50 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                    }}
                  >
                    {promotions.map((promotion) => (
                      <button
                        key={promotion.id}
                        type="button"
                        onClick={() => handlePromotionSelect(promotion.name)}
                        className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors duration-300 cursor-pointer border-b border-blue-100 last:border-b-0 text-base"
                      >
                        {promotion.name}
                      </button>
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

                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                  />
                </div>

                <div className="relative" ref={studentDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!studentDropdownOpen && studentDropdownRef.current) {
                        const rect =
                          studentDropdownRef.current.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + 5,
                          left: rect.left,
                          width: rect.width,
                        });
                      }
                      setStudentDropdownOpen(!studentDropdownOpen);
                    }}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer flex items-center justify-between"
                  >
                    <span
                      className={
                        selectedStudent ? "text-blue-900" : "text-white"
                      }
                    >
                      {selectedStudent
                        ? students.find((s) => s.id === selectedStudent)
                            ?.firstName +
                          " " +
                          students.find((s) => s.id === selectedStudent)
                            ?.lastName
                        : "Sélectionnez un étudiant"}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-blue-400 transition-transform duration-300 ${
                        studentDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {studentDropdownOpen && (
                    <div
                      className="fixed z-50 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                      style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                      }}
                    >
                      {studentsLoading ? (
                        <div className="px-6 py-4 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                          <span className="text-blue-600">
                            Chargement des étudiants...
                          </span>
                        </div>
                      ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => handleStudentSelect(student.id)}
                            className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors duration-300 cursor-pointer border-b border-blue-100 last:border-b-0"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-900 text-base">
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="text-sm text-blue-600 mt-1">
                                {student.email}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-blue-600 text-base">
                          {selectedPromotion
                            ? "Aucun étudiant trouvé dans cette promotion"
                            : "Sélectionnez d'abord une promotion"}
                        </div>
                      )}
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Chargement du profil étudiant...</p>
          </div>
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
                  <Image
                    src={
                      studentData.profileImage &&
                      studentData.profileImage.trim() !== ""
                        ? studentData.profileImage
                        : "/default-avatar.png"
                    }
                    alt="Photo de profil"
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-blue-200 shadow-lg"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    {studentData.firstName} {studentData.lastName}
                  </h2>
                  <p className="text-blue-800/80 mb-1">
                    {studentData.role} - {studentData.promotion}
                  </p>
                  <p className="text-blue-700/70 text-sm">
                    {studentData.campus}
                  </p>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="flex w-full justify-around">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800/60">Email</p>
                    <p className="text-blue-900 font-medium">
                      {studentData.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800/60">Téléphone</p>
                    <p className="text-blue-900 font-medium">
                      {studentData.phone}
                    </p>
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
            <ProfileSection title="Compétences techniques" icon={Target}>
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
            <ProfileSection title="Projets récents" icon={BookOpen}>
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
                <Button
                  className="w-full !border-blue-600 !text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 cursor-pointer"
                  variant="outline"
                >
                  Exporter les données
                </Button>
                <Button
                  className="w-full !border-green-600 !text-green-600 hover:!bg-green-50 hover:!text-green-700 cursor-pointer"
                  variant="outline"
                >
                  Voir les projets
                </Button>
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
