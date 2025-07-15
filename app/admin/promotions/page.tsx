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
  Eye,
  EyeOff,
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

interface Promotion {
  id: number;
  name: string;
  created_at: string;
  is_active?: boolean;
  student_count?: number;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const secondDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Hook pour récupérer les promotions
  const {
    promotions: hookPromotions,
    loading: promotionsLoading,
    error: promotionsError,
    refetch: refetchPromotions,
  } = usePromotionsData();

  // Utiliser les données du hook usePromotionsData
  useEffect(() => {
    if (!promotionsLoading) {
      setLoading(false);
      if (promotionsError) {
        setError(promotionsError);
      } else {
        // Ajouter les champs manquants avec des valeurs par défaut
        const promotionsWithDefaults = hookPromotions.map((promotion) => ({
          ...promotion,
          is_active:
            promotion.is_active !== undefined ? promotion.is_active : true,
          student_count: promotion.student_count || 0,
        }));
        setPromotions(promotionsWithDefaults);
        setError(null);
      }
    }
  }, [hookPromotions, promotionsLoading, promotionsError]);

  useEffect(() => {
    let filtered = promotions;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter((promo) =>
        promo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((promo) =>
        statusFilter === "active" ? promo.is_active : !promo.is_active
      );
    }

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
      <div className="flex flex-wrap gap-4 mb-10">
        <AdminButton onClick={() => router.push("/admin/promotions/create")}>
          <Plus size={20} />
          Nouvelle Promotion
        </AdminButton>
      </div>

      {/* Statistiques */}
      <AdminStatsCards
        stats={createPromotionsStats(
          promotions.length,
          promotions.filter((promo) => promo.is_active).length,
          promotions.filter((promo) => !promo.is_active).length
        )}
      />

      {/* Filtres et recherche */}
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Rechercher par nom de promotion..."
        showSearch={true}
        selectedPromotion={statusFilter}
        setSelectedPromotion={(value: string) =>
          setStatusFilter(value as "all" | "active" | "inactive")
        }
        promotions={["active", "inactive"]}
        promotionPlaceholder="Tous les statuts"
        showPromotionFilter={true}
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
                    className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md ${
                      !promotion.is_active ? "opacity-60" : ""
                    }`}
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                promotion.is_active
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {promotion.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-blue-600">
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>
                                {promotion.student_count || 0} étudiants
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            /* TODO: Implémenter le toggle de statut */
                            const updatedPromotions = promotions.map((p) =>
                              p.id === promotion.id
                                ? { ...p, is_active: !p.is_active }
                                : p
                            );
                            setPromotions(updatedPromotions);
                          }}
                          className="group/btn border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          {promotion.is_active ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            /* TODO: Implémenter la suppression */
                          }}
                          variant="outline"
                          size="sm"
                          className="group/btn border border-red-200 text-red-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
    </div>
  );
}
