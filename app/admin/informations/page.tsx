"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Calendar
  // Search,
  // Filter,
  // MoreVertical,
  // ChevronDown,
  // Loader2,
  // Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminButton from "@/components/admin/buttons/AdminButton";
// import AdminStatsCards, {
//   createInformationsStats,
// } from "@/components/admin/AdminStatsCards";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import {
  getInformations,
  // createInformation,
  // updateInformation,
  deleteInformation,
  // toggleInformationStatus,
  type Information,
  InformationWithCreator,
} from "@/lib/informationsData";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  roles_user: string;
}

const INITIAL_DISPLAY_COUNT = 6;

export default function AdminInformations() {
  const router = useRouter();
  const [informations, setInformations] = useState<InformationWithCreator[]>([]);
  const [filteredInformations, setFilteredInformations] = useState<
    InformationWithCreator[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [informationToDelete, setInformationToDelete] =
    useState<InformationWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_DISPLAY_COUNT);

  // Références pour les dropdowns
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const secondDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInformations();
      setInformations(data);
      setFilteredInformations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = informations;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (info) =>
          info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.creator_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by most recent (updated_at or created_at)
    filtered = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });

    setFilteredInformations(filtered);
    setDisplayedCount(INITIAL_DISPLAY_COUNT); // Reset le compteur quand les filtres changent
  }, [informations, searchTerm, statusFilter]);

  const handleDelete = (information: Information) => {
    setInformationToDelete(information);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (informationToDelete) {
      try {
        await deleteInformation(String(informationToDelete.id));
        setInformations((prev) =>
          prev.filter((info) => info.id !== informationToDelete.id)
        );
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
    setIsDeleteModalOpen(false);
    setInformationToDelete(null);
  };

  // const handleToggleStatus = (information: Information) => {
  //   try {
  //     const updated = toggleInformationStatus(information.id);
  //     if (updated) {
  //       setInformations((prev) =>
  //         prev.map((info) => (info.id === information.id ? updated : info))
  //     );
  //   } catch (error) {
  //     console.error("Erreur lors du changement de statut:", error);
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + INITIAL_DISPLAY_COUNT);
  };

  const displayedInformations = filteredInformations.slice(0, displayedCount);
  const hasMore = displayedCount < filteredInformations.length;

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-12">
      <Header
        title="Gestion des Informations"
        description="Créer et gérer les annonces générales"
      />

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-10">
        <AdminButton onClick={() => router.push("/admin/informations/create")}>
          <Plus size={20} />
          Nouvelle Information
        </AdminButton>
      </div>

      {/* Statistiques */}
      {/* <AdminStatsCards
        stats={createInformationsStats(
          informations.length,
          informations.length,
          0
        )}
      /> */}

      {/* Filtres et recherche */}
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Rechercher par titre, contenu ou auteur..."
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

      {/* Liste des informations */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200/50">
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h2 className="font-bold text-xl sm:text-2xl text-blue-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
            </div>
            Liste des informations
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          {filteredInformations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-blue-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Aucune information trouvée
              </h3>
              <p className="text-blue-700">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune information ne correspond à vos critères de recherche."
                  : "Aucune information n'a encore été créée."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedInformations.map((information) => (
                  <div
                    key={information.id}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                          <User className="text-blue-700" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-semibold text-blue-900 text-base sm:text-lg break-words">
                              {information.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
                                {information.creator_role === "admin"
                                  ? "Admin"
                                  : information.creator_role === "advisor"
                                  ? "Conseiller"
                                  : "Externe"}
                              </span>
                            </div>
                          </div>
                          <p className="text-blue-800 mb-3 leading-relaxed break-words">
                            {information.message}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Calendar size={16} />
                            <span className="whitespace-nowrap">
                              {formatDate(information.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/informations/edit/${information.id}`
                            )
                          }
                          className="group/btn border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-2 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(information)}
                          variant="outline"
                          size="sm"
                          className="group/btn border border-red-200 text-red-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 font-medium px-2 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          <Trash2 size={14} />
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
                    Afficher plus d'informations
                  </AdminButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && informationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="mb-6 text-blue-800">
              Êtes-vous sûr de vouloir supprimer l'information "
              {informationToDelete.title}" ? Cette action est irréversible.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setInformationToDelete(null);
                }}
                className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
