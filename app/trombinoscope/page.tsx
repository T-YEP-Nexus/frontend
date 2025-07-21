"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { ChevronDown, Users, GraduationCap } from "lucide-react";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import { useRef } from "react";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  campus?: string;
  promotion?: string;
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

  // Références pour les dropdowns
  const promotionDropdownRef = useRef<HTMLDivElement>(null);
  const secondDropdownRef = useRef<HTMLDivElement>(null);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);

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
              `http://localhost:3004/student/profile/${userId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (studentRes.ok) {
              const studentData = await studentRes.json();
              setUserPromotion(studentData.data.promotion);
              setSelectedPromotion(studentData.data.promotion);
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de la promotion:",
              error
            );
          }
        }

        // Récupérer toutes les promotions pour admin/advisor
        if (role === "admin" || role === "advisor") {
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
      if (!selectedPromotion) return;

      try {
        setIsLoading(true);

        // D'abord, trouver l'ID de la promotion à partir du nom
        const selectedPromotionData = promotions.find(
          (p) => p.name === selectedPromotion
        );

        if (!selectedPromotionData) {
          setError("Promotion non trouvée");
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
                  promotion: selectedPromotion,
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
  }, [selectedPromotion, promotions]);

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
        {selectedPromotion && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                {userRole === "student"
                  ? "Ma promotion"
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
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
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
    </div>
  );
}
