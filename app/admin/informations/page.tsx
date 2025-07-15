"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header/Header";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminStatsCards, {
  createInformationsStats,
} from "@/components/admin/AdminStatsCards";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import {
  getInformations,
  createInformation,
  updateInformation,
  deleteInformation,
  toggleInformationStatus,
  type Information,
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
  const [informations, setInformations] = useState<Information[]>([]);
  const [filteredInformations, setFilteredInformations] = useState<
    Information[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [informationToDelete, setInformationToDelete] =
    useState<Information | null>(null);
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

  const loadData = () => {
    setLoading(true);
    try {
      const data = getInformations();
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
          info.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((info) =>
        statusFilter === "active" ? info.isActive : !info.isActive
      );
    }

    setFilteredInformations(filtered);
    setDisplayedCount(INITIAL_DISPLAY_COUNT); // Reset le compteur quand les filtres changent
  }, [informations, searchTerm, statusFilter]);

  const handleDelete = (information: Information) => {
    setInformationToDelete(information);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (informationToDelete) {
      try {
        const success = deleteInformation(informationToDelete.id);
        if (success) {
          setInformations((prev) =>
            prev.filter((info) => info.id !== informationToDelete.id)
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
    setIsDeleteModalOpen(false);
    setInformationToDelete(null);
  };

  const handleToggleStatus = (information: Information) => {
    try {
      const updated = toggleInformationStatus(information.id);
      if (updated) {
        setInformations((prev) =>
          prev.map((info) => (info.id === information.id ? updated : info))
        );
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

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
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <Header
        title="Gestion des Informations"
        description="Créer et gérer les annonces générales"
      />

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-4 mb-10">
        <AdminButton onClick={() => router.push("/admin/informations/create")}>
          <Plus size={20} />
          Nouvelle Information
        </AdminButton>
      </div>

      {/* Statistiques */}
      <AdminStatsCards
        stats={createInformationsStats(
          informations.length,
          informations.filter((info) => info.isActive).length,
          informations.filter((info) => !info.isActive).length
        )}
      />

      {/* Filtres et recherche */}
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Rechercher par titre, contenu ou auteur..."
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

      {/* Liste des informations */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200/50">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-700" />
            </div>
            Liste des informations
          </h2>
        </div>

        <div className="p-6">
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
                    className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md ${
                      !information.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg">
                          <User className="text-blue-700" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-blue-900 text-lg">
                              {information.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                information.isActive
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {information.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {information.authorRole === "admin"
                                ? "Admin"
                                : information.authorRole === "advisor"
                                ? "Conseiller"
                                : "Externe"}
                            </span>
                          </div>
                          <p className="text-blue-800 mb-3 leading-relaxed">
                            {information.content}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Calendar size={16} />
                            {formatDate(information.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(information)}
                          className="group/btn border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          {information.isActive ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/informations/edit/${information.id}`
                            )
                          }
                          className="group/btn border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(information)}
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
