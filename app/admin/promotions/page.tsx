"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Users,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminStatsCards, {
  createPromotionsStats,
} from "@/components/admin/AdminStatsCards";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import usePromotionsData from "@/hooks/usePromotionsData";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";

interface Promotion {
  id: string;
  name: string;
  created_at: string;
  student_count?: number;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const secondDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Utiliser le hook pour récupérer l'utilisateur connecté
  const { userData: currentUser } = useUserData(getUserIdFromToken());

  // Vérifier si l'utilisateur peut créer/supprimer des promotions
  const canManagePromotions = currentUser?.role === "admin";

  // Hook pour récupérer les promotions
  const {
    promotions: hookPromotions,
    loading: promotionsLoading,
    error: promotionsError,
    refetch: refetchPromotions,
  } = usePromotionsData();

  // État pour stocker le nombre d'étudiants par promotion
  const [studentsCount, setStudentsCount] = useState<{ [key: string]: number }>(
    {}
  );

  // État pour gérer la suppression
  const [deletingPromotion, setDeletingPromotion] = useState<string | null>(
    null
  );

  // État pour la popup de confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Utiliser les données du hook usePromotionsData
  useEffect(() => {
    if (!promotionsLoading) {
      setLoading(false);
      if (promotionsError) {
        setError(promotionsError);
      } else {
        // Ajouter les champs manquants avec des valeurs par défaut
        const promotionsWithDefaults = hookPromotions.map((promotion) => ({
          id: promotion.id,
          name: promotion.name,
          created_at: promotion.created_at,
          student_count: promotion.student_count || 0,
        }));
        setPromotions(promotionsWithDefaults);
        setError(null);

        // Récupérer le nombre d'étudiants pour chaque promotion
        fetchStudentsCountForAllPromotions();
      }
    }
  }, [hookPromotions, promotionsLoading, promotionsError]);

  // Fonction pour récupérer le nombre d'étudiants pour toutes les promotions
  const fetchStudentsCountForAllPromotions = async () => {
    try {
      const counts: { [key: string]: number } = {};

      console.log("=== DEBUG fetchStudentsCountForAllPromotions ===");
      console.log("hookPromotions:", hookPromotions);

      for (const promotion of hookPromotions) {
        try {
          console.log(
            `Récupération des étudiants pour la promotion ${promotion.id} (${promotion.name})`
          );

          const response = await fetch(
            `http://localhost:3004/students/promotion/${promotion.id}`
          );

          console.log(`Response status pour ${promotion.id}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`Data pour ${promotion.id}:`, data);

            if (data.success) {
              counts[promotion.id] = data.data.length;
              console.log(
                `Nombre d'étudiants pour ${promotion.id}:`,
                data.data.length
              );
            } else {
              counts[promotion.id] = 0;
              console.log(`Erreur API pour ${promotion.id}:`, data.message);
            }
          } else {
            const errorText = await response.text();
            console.error(
              `Erreur HTTP pour ${promotion.id}:`,
              response.status,
              errorText
            );
            counts[promotion.id] = 0;
          }
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des étudiants pour la promotion ${promotion.id}:`,
            error
          );
          counts[promotion.id] = 0;
        }
      }

      console.log("Counts final:", counts);
      setStudentsCount(counts);
      console.log("========================");
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des comptes d'étudiants:",
        error
      );
    }
  };

  useEffect(() => {
    let filtered = promotions;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter((promo) =>
        promo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut (supprimé car plus de is_active)
    // if (statusFilter !== "all") {
    //   filtered = filtered.filter((promo) =>
    //     statusFilter === "active" ? promo.is_active : !promo.is_active
    //   );
    // }

    setFilteredPromotions(filtered);
    setDisplayedCount(6); // Reset le compteur quand les filtres changent
  }, [promotions, searchTerm, statusFilter]);

  // Gestionnaire de clic à l'extérieur pour fermer les dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + 6);
  };

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    refetchPromotions();
  };

  // Fonction pour supprimer une promotion
  const handleDeletePromotion = (
    promotionId: string,
    promotionName: string
  ) => {
    setPromotionToDelete({ id: promotionId, name: promotionName });
    setShowDeleteConfirm(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDelete = async () => {
    if (!promotionToDelete) return;

    setDeletingPromotion(promotionToDelete.id);
    setShowDeleteConfirm(false);

    try {
      const response = await fetch(
        `http://localhost:3004/promotion/${promotionToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Supprimer la promotion de la liste locale
        setPromotions((prev) =>
          prev.filter((p) => p.id !== promotionToDelete.id)
        );
        setFilteredPromotions((prev) =>
          prev.filter((p) => p.id !== promotionToDelete.id)
        );

        // Rafraîchir les données
        refetchPromotions();

        // Afficher un message de succès (optionnel)
        alert(`Promotion "${promotionToDelete.name}" supprimée avec succès.`);
      } else {
        // Gérer les erreurs spécifiques
        let errorMessage = data.message || "Erreur lors de la suppression";

        if (response.status === 409) {
          errorMessage = `Impossible de supprimer la promotion "${promotionToDelete.name}" : elle est actuellement utilisée par des étudiants.`;
        } else if (response.status === 404) {
          errorMessage = `Promotion "${promotionToDelete.name}" introuvable.`;
        }

        alert(`Erreur : ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la promotion:", error);
      alert("Erreur de connexion lors de la suppression de la promotion.");
    } finally {
      setDeletingPromotion(null);
      setPromotionToDelete(null);
    }
  };

  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPromotionToDelete(null);
  };

  const displayedPromotions = filteredPromotions.slice(0, displayedCount);
  const hasMore = displayedCount < filteredPromotions.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <Header
        title="Gestion des Promotions"
        description="Créer et gérer les promotions d'étudiants"
      />

      {/* Boutons d'action */}
      {canManagePromotions && (
        <div className="flex flex-wrap gap-4 mb-10">
          <AdminButton onClick={() => router.push("/admin/promotions/create")}>
            <Plus size={20} />
            Nouvelle Promotion
          </AdminButton>
        </div>
      )}

      {/* Statistiques */}
      {/* <AdminStatsCards
        stats={createPromotionsStats(promotions.length, promotions.length, 0)}
      /> */}

      {/* Filtres et recherche */}
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Rechercher par nom de promotion..."
        showSearch={true}
        selectedPromotion={statusFilter}
        setSelectedPromotion={(value: string) => setStatusFilter(value)}
        promotions={[]}
        promotionPlaceholder=""
        showPromotionFilter={false}
        selectedSecond="all"
        setSelectedSecond={() => {}}
        seconds={[]}
        secondLabel=""
        secondPlaceholder=""
        showSecondFilter={false}
        promotionDropdownRef={statusDropdownRef}
        secondDropdownRef={secondDropdownRef}
        promotionDropdownOpen={statusDropdownOpen}
        setPromotionDropdownOpen={setStatusDropdownOpen}
        secondDropdownOpen={false}
        setSecondDropdownOpen={() => {}}
        title="Filtres et recherche"
        showTitle={true}
      />

      {/* Liste des promotions */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200/50">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
              <GraduationCap className="w-6 h-6 text-blue-700" />
            </div>
            Liste des promotions
          </h2>
        </div>

        <div className="p-6">
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto text-blue-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Aucune promotion trouvée
              </h3>
              <p className="text-blue-700">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune promotion ne correspond à vos critères de recherche."
                  : "Aucune promotion n'a encore été créée."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedPromotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg">
                          <GraduationCap className="text-blue-700" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-blue-900 text-lg">
                              {promotion.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-blue-600">
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>
                                {studentsCount[promotion.id.toString()] || 0}{" "}
                                étudiants
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>
                                Créée le {formatDate(promotion.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {canManagePromotions && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              handleDeletePromotion(
                                promotion.id,
                                promotion.name
                              )
                            }
                            disabled={deletingPromotion === promotion.id}
                            variant="outline"
                            size="sm"
                            className="group/btn border border-red-200 text-red-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingPromotion === promotion.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <AdminButton onClick={handleShowMore}>
                    <Plus size={20} />
                    Afficher plus de promotions
                  </AdminButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && promotionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              {/* Icône d'avertissement */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>

              {/* Titre */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer la promotion
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la promotion{" "}
                <span className="font-semibold text-gray-800">
                  "{promotionToDelete.name}"
                </span>
                ?
              </p>

              <p className="text-sm text-red-600 mb-6 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                ⚠️ Cette action est irréversible et ne peut pas être annulée.
              </p>

              {/* Boutons d'action */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingPromotion === promotionToDelete.id}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingPromotion === promotionToDelete.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
