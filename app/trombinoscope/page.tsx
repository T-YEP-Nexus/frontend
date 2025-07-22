"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import {
  ChevronDown,
  Users,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  BookOpen,
  Clock,
  Home,
  X,
  User,
} from "lucide-react";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  campus?: string;
  promotion?: string;
  // Informations complètes à récupérer
  phone?: string;
  address?: string;
  student_number?: string;
  major?: string;
  created_at?: string;
  updated_at?: string;
}

interface Promotion {
  id: string;
  name: string;
  campus: string;
}

export default function TrombinoscopePage() {
  const router = useRouter();
  const { isLoading: roleLoading } = useRoleRedirect();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPromotion, setUserPromotion] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Références pour les dropdowns
  const promotionDropdownRef = useRef<HTMLDivElement>(null);
  const secondDropdownRef = useRef<HTMLDivElement>(null);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);

  // Fonction pour ouvrir la modale
  const handleViewStudent = async (student: Student) => {
    // Ouvrir la modale immédiatement avec les données de base
    setSelectedStudent(student);
    setIsModalOpen(true);
    setIsModalLoading(true);

    // Animation d'ouverture immédiate
    setTimeout(() => {
      setIsModalVisible(true);
    }, 10);

    try {
      // Récupérer toutes les informations de l'étudiant en parallèle
      const [profileResponse, studentResponse, userResponse] =
        await Promise.all([
          fetch(`http://localhost:3004/profile/${student.id}`),
          fetch(`http://localhost:3004/student/profile/${student.id}`),
          fetch("http://localhost:3001/users"),
        ]);

      const profileData = profileResponse.ok
        ? await profileResponse.json()
        : { success: false, data: {} };
      const studentData = studentResponse.ok
        ? await studentResponse.json()
        : { success: false, data: null };
      const userData = userResponse.ok
        ? await userResponse.json()
        : { success: false, data: [] };

      const user = userData.success
        ? userData.data.find((u: any) => u.id === profileData.data?.id_user)
        : null;

      // Combiner toutes les informations
      const completeStudent: Student = {
        ...student,
        phone: profileData.success ? profileData.data?.phone || "" : "",
        address: profileData.success ? profileData.data?.address || "" : "",
        student_number: studentData.success
          ? studentData.data?.student_number || ""
          : "",
        major: studentData.success ? studentData.data?.major || "" : "",
        created_at: profileData.success ? profileData.data?.created_at : "",
        updated_at: profileData.success ? profileData.data?.updated_at : "",
        email: user
          ? user.email
          : profileData.success
          ? profileData.data?.email
          : student.email,
      };

      setSelectedStudent(completeStudent);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'étudiant:",
        error
      );
      // En cas d'erreur, on garde les informations de base
    } finally {
      setIsModalLoading(false);
    }
  };

  // Fonction pour fermer la modale
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedStudent(null);
    }, 300); // Durée de l'animation
  };

  // Récupérer les données utilisateur et déterminer le rôle
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          router.push("/login");
          return;
        }

        const profileData = await getUserProfileData(userId);
        const role = profileData.roles_user;
        setUserRole(role);

        // Si c'est un étudiant, récupérer sa promotion
        if (role === "student") {
          try {
            const studentRes = await fetch(
              `http://localhost:3004/student/profile/${profileData.id}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (studentRes.ok) {
              const studentData = await studentRes.json();
              console.log("Données étudiant dans trombinoscope:", studentData);
              console.log("Données étudiant complètes:", studentData.data);
              console.log(
                "ID promotion étudiant:",
                studentData.data?.id_promotion
              );
              console.log(
                "Toutes les propriétés de studentData.data:",
                Object.keys(studentData.data || {})
              );

              // Récupérer toutes les promotions pour convertir l'ID en nom
              const promotionsRes = await fetch(
                "http://localhost:3004/promotions"
              );
              if (promotionsRes.ok) {
                const promotionsData = await promotionsRes.json();
                console.log(
                  "Promotions disponibles dans trombinoscope:",
                  promotionsData
                );
                // Stocker les promotions pour tous les rôles
                setPromotions(promotionsData.data || []);

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
                const promotionId = studentData.data?.id_promotion;
                console.log("ID promotion à convertir:", promotionId);
                const promotionName = getPromotionNameById(promotionId);
                console.log("Nom de promotion trouvé:", promotionName);
                setUserPromotion(promotionName);
                setSelectedPromotion(promotionName);
              }
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de la promotion:",
              error
            );
          }
        }

        // Récupérer toutes les promotions pour admin/advisor (si pas déjà fait pour étudiant)
        if (
          (role === "admin" || role === "advisor") &&
          promotions.length === 0
        ) {
          try {
            const promotionsRes = await fetch(
              "http://localhost:3004/promotions",
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (promotionsRes.ok) {
              const promotionsData = await promotionsRes.json();
              setPromotions(promotionsData.data || []);
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des promotions:",
              error
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Récupérer les étudiants selon la promotion sélectionnée
  useEffect(() => {
    const fetchStudents = async () => {
      // Pour les étudiants, utiliser userPromotion, pour les autres selectedPromotion
      const promotionToUse =
        userRole === "student" ? userPromotion : selectedPromotion;
      if (!promotionToUse) return;

      try {
        setIsLoading(true);

        // D'abord, trouver l'ID de la promotion à partir du nom
        const selectedPromotionData = promotions.find(
          (p) => p.name === promotionToUse
        );

        if (!selectedPromotionData) {
          setError(`Promotion non trouvée: ${promotionToUse}`);
          return;
        }

        // Utiliser l'ID de la promotion pour récupérer les étudiants
        const studentsRes = await fetch(
          `http://localhost:3004/students/promotion/${selectedPromotionData.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();

          if (studentsData.success) {
            // Récupérer les profils utilisateurs pour les étudiants trouvés
            const studentIds = studentsData.data.map(
              (student: any) => student.id_user_profile
            );

            if (studentIds.length === 0) {
              setStudents([]);
              return;
            }

            // Récupérer les profils utilisateurs
            const profilesResponse = await fetch(
              "http://localhost:3004/profiles"
            );
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
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  email: user ? user.email : profile.email,
                  avatar: profile.avatar,
                  campus: profile.campus,
                  promotion: promotionToUse,
                };
              })
              .filter(Boolean);

            setStudents(studentsWithProfiles);
          } else {
            setError(
              studentsData.message ||
                "Erreur lors de la récupération des étudiants"
            );
          }
        } else {
          const errorText = await studentsRes.text();
          console.error("Erreur API:", studentsRes.status, errorText);
          setError(
            `Erreur lors de la récupération des étudiants (${studentsRes.status})`
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des étudiants:", error);
        setError("Erreur lors du chargement des étudiants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedPromotion, promotions, userPromotion, userRole]);

  if (roleLoading) {
    return <AdminLoading message="Vérification des droits d'accès..." />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Trombinoscope" />
        <div className="max-w-7xl mx-auto flex items-center justify-center mt-6 sm:mt-8">
          <AdminLoading message="Chargement du trombinoscope..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Trombinoscope" />
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header title="Trombinoscope" />

      <div className="max-w-7xl mx-auto">
        {/* Sélecteur de promotion pour admin/advisor */}
        {(userRole === "admin" || userRole === "advisor") && (
          <div className="mb-8">
            <AdminFilterBar
              searchTerm=""
              setSearchTerm={() => {}}
              showSearch={false}
              selectedPromotion={selectedPromotion || "all"}
              setSelectedPromotion={(promo) => {
                if (promo === "all") {
                  setSelectedPromotion(null);
                } else {
                  setSelectedPromotion(promo);
                }
              }}
              promotions={promotions.map((p) => p.name)}
              promotionsLoading={isLoading}
              promotionLabel="Promotion"
              promotionPlaceholder="Choisir une promotion"
              showPromotionFilter={true}
              selectedSecond="all"
              setSelectedSecond={() => {}}
              seconds={[]}
              secondLabel=""
              secondPlaceholder=""
              showSecondFilter={false}
              promotionDropdownRef={promotionDropdownRef}
              secondDropdownRef={secondDropdownRef}
              promotionDropdownOpen={promotionDropdownOpen}
              setPromotionDropdownOpen={setPromotionDropdownOpen}
              secondDropdownOpen={false}
              setSecondDropdownOpen={() => {}}
              title="Sélectionner une promotion"
              showTitle={true}
            />
          </div>
        )}

        {/* Affichage des étudiants */}
        {((userRole === "student" && userPromotion) ||
          (userRole !== "student" && selectedPromotion)) && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                {userRole === "student"
                  ? `Ma promotion (${userPromotion})`
                  : `Promotion ${selectedPromotion}`}
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {students.length} étudiant{students.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                  onClick={() => handleViewStudent(student)}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                      {student.avatar ||
                        `${student.first_name
                          .charAt(0)
                          .toUpperCase()}${student.last_name
                          .charAt(0)
                          .toUpperCase()}`}
                    </div>

                    {/* Informations */}
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {student.first_name} {student.last_name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-2">
                      {student.email}
                    </p>

                    {student.campus && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {student.campus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Aucun étudiant trouvé
                </h3>
                <p className="text-gray-400">
                  {userRole === "student"
                    ? "Aucun étudiant dans votre promotion pour le moment."
                    : "Aucun étudiant dans cette promotion pour le moment."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message si aucune promotion sélectionnée (admin/advisor) */}
        {!selectedPromotion &&
          (userRole === "admin" || userRole === "advisor") && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Sélectionnez une promotion
              </h3>
              <p className="text-white/70">
                Choisissez une promotion dans le menu déroulant ci-dessus pour
                voir les étudiants.
              </p>
            </div>
          )}
      </div>

      {/* Modale de détails de l'étudiant */}
      {isModalOpen && selectedStudent && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
            isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ${
              isModalVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transform: isModalVisible
                ? "translateY(0) scale(1)"
                : "translateY(2rem) scale(0.95)",
            }}
          >
            {/* Header de la modale */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Détails de l'étudiant</h2>
                    <p className="text-blue-100 text-sm">
                      Informations complètes du profil
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenu de la modale */}
            <div className="p-6 space-y-6">
              {/* Indicateur de chargement */}
              {isModalLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
                      Chargement des détails...
                    </span>
                  </div>
                </div>
              )}

              {/* Photo de profil et informations principales */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-200 shadow-lg">
                    {selectedStudent.avatar ||
                      `${selectedStudent.first_name
                        .charAt(0)
                        .toUpperCase()}${selectedStudent.last_name
                        .charAt(0)
                        .toUpperCase()}`}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      <GraduationCap size={20} className="text-blue-600" />
                    </div>
                    <span className="text-lg font-semibold text-blue-700">
                      Étudiant
                    </span>
                  </div>
                  {selectedStudent.student_number && (
                    <div className="text-blue-600 font-medium mb-1">
                      Numéro étudiant: {selectedStudent.student_number}
                    </div>
                  )}
                  {selectedStudent.promotion && (
                    <div className="text-blue-600 font-medium mb-1">
                      Promotion: {selectedStudent.promotion}
                    </div>
                  )}
                  {selectedStudent.major && (
                    <div className="text-blue-600 font-medium">
                      Spécialité: {selectedStudent.major}
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Informations de contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Email</p>
                      <p className="text-blue-900">{selectedStudent.email}</p>
                    </div>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Téléphone
                        </p>
                        <p className="text-blue-900">{selectedStudent.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.campus && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Campus
                        </p>
                        <p className="text-blue-900">
                          {selectedStudent.campus}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="flex items-center gap-3">
                      <Home size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Adresse
                        </p>
                        <p className="text-blue-900">
                          {selectedStudent.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations académiques */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" />
                  Informations académiques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudent.promotion && (
                    <div className="flex items-center gap-3">
                      <GraduationCap size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Promotion
                        </p>
                        <p className="text-blue-900">
                          {selectedStudent.promotion}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.major && (
                    <div className="flex items-center gap-3">
                      <BookOpen size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Spécialité
                        </p>
                        <p className="text-blue-900">{selectedStudent.major}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.student_number && (
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Numéro étudiant
                        </p>
                        <p className="text-blue-900">
                          {selectedStudent.student_number}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.created_at && (
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Date de création
                        </p>
                        <p className="text-blue-900">
                          {new Date(
                            selectedStudent.created_at
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6 border-t border-blue-200">
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    handleCloseModal();
                    router.push(
                      `/admin/profile?studentId=${selectedStudent.id}&showOtherUsers=true`
                    );
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
                >
                  <User size={20} />
                  Voir le profil complet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
