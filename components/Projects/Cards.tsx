"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";
import { getUserIdFromToken } from "@/lib/auth";

interface CardsProps {
  projectName: string;
  progress?: number; // Pourcentage de progression (0-100)
  description: string;
  details: {
    startDate: string;
    endDate: string;
    team: string;
  };
  tasks: string[];
  deadline: {
    kickOff: string;
    followUp: string;
    keynote: string;
    daysRemaining: number;
  };
  documentation: {
    pdfUrl?: string;
    pdfName: string;
  };
  ressources?: Array<{
    url?: string;
    filename?: string;
    name?: string;
    uploaded_at?: string;
  }>; // Ajout des vraies ressources
  trophies?: { name: string; obtained: boolean; description: string }[];
  isExpanded?: boolean;
  onToggle?: () => void;
  isBlurred?: boolean;
  projectId?: number; // Ajout de l'ID du projet pour la navigation
  userRole?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function Cards({
  projectName,
  progress = 75,
  description,
  details,
  tasks,
  deadline,
  documentation,
  ressources = [],
  trophies = [],
  isExpanded = false,
  onToggle,
  isBlurred = false,
  projectId,
  userRole,
  onEdit,
  onDelete,
}: CardsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const expandedCardRef = useRef<HTMLDivElement>(null);
  const [medals, setMedals] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);

  // Fonction pour récupérer les données étudiant
  const fetchStudentData = React.useCallback(async () => {
    try {
      // D'abord, essayer de récupérer depuis localStorage
      const retrievedData = localStorage.getItem("studentData");
      console.log("Données localStorage récupérées dans Cards:", retrievedData);

      if (retrievedData) {
        const parsedData = JSON.parse(retrievedData);
        console.log("Données localStorage parsées dans Cards:", parsedData);
        setStudentData(parsedData);
        return parsedData;
      }

      // Si pas de données dans localStorage, faire l'appel API
      console.log(
        "Aucune donnée localStorage, récupération via API dans Cards..."
      );
      const userId = getUserIdFromToken();

      if (!userId) {
        console.log("Pas d'ID utilisateur trouvé dans Cards");
        return null;
      }

      // Récupérer les données utilisateur
      const userRes = await fetch(
        `http://localhost:3004/profile/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!userRes.ok) {
        throw new Error(
          "Erreur lors de la récupération des données utilisateur"
        );
      }

      const userData = await userRes.json();
      console.log("Données utilisateur récupérées dans Cards:", userData);

      // Si c'est un étudiant, récupérer ses données complètes
      if (userData.data.roles_user === "student") {
        const studentRes = await fetch(
          `http://localhost:3004/student/profile/${userData.data.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (studentRes.ok) {
          const studentApiData = await studentRes.json();
          console.log(
            "Données étudiant API récupérées dans Cards:",
            studentApiData
          );

          // Sauvegarder dans localStorage pour les prochaines fois
          localStorage.setItem("studentData", JSON.stringify(studentApiData));
          setStudentData(studentApiData);
          return studentApiData;
        }
      }

      return null;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données étudiant dans Cards:",
        error
      );
      return null;
    }
  }, []);

  // Fonction pour récupérer les médailles
  const fetchMedals = React.useCallback(async () => {
    if (!projectId || !studentData?.data?.id) {
      return;
    }

    try {
      // Récupérer les assignations du projet pour obtenir les médailles
      const assignmentsRes = await fetch(
        `http://localhost:3003/project-students/project/${projectId}`,
        {
          credentials: "include",
        }
      );
      const assignmentsJson = assignmentsRes.ok
        ? await assignmentsRes.json()
        : { success: false, data: [] };
      const assignments = assignmentsJson.success ? assignmentsJson.data : [];

      // Prendre la première assignation pour récupérer les médailles
      if (assignments.length > 0) {
        for (const assign of assignments) {
          console.log("Assignation trouvée dans Cards:", assign);
          if (assign.id_student === studentData.data.id) {
            setMedals(assign.score || []);
            console.log("Médailles pour l'étudiant dans Cards:", assign.score);
            break; // Sortir de la boucle une fois qu'on a trouvé l'assignation
          }
        }
      }
    } catch (error) {
      console.error("❌ Error fetching medals in Cards:", error);
      setMedals([]);
    }
  }, [projectId, studentData?.data?.id]);

  // Initialiser les données étudiant au montage du composant
  useEffect(() => {
    const initializeData = async () => {
      // Attendre un peu pour laisser le temps à la sidebar de sauvegarder les données
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Récupérer les données étudiant
      await fetchStudentData();
    };

    initializeData();
  }, [fetchStudentData]);

  // Écouter les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "studentData" && e.newValue) {
        console.log("Changement détecté dans localStorage Cards:", e.newValue);
        const parsedData = JSON.parse(e.newValue);
        setStudentData(parsedData);
      }
    };

    // Écouter les changements de localStorage depuis d'autres onglets/fenêtres
    window.addEventListener("storage", handleStorageChange);

    // Vérifier périodiquement les changements dans le même onglet
    const checkInterval = setInterval(() => {
      const currentData = localStorage.getItem("studentData");
      if (currentData && currentData !== JSON.stringify(studentData)) {
        console.log(
          "Changement détecté dans localStorage Cards (polling):",
          currentData
        );
        const parsedData = JSON.parse(currentData);
        setStudentData(parsedData);
      }
    }, 1000); // Vérifier toutes les secondes

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [studentData]);

  // Récupérer les médailles quand les données étudiant sont disponibles
  useEffect(() => {
    if (studentData?.data?.id && projectId) {
      fetchMedals();
    }
  }, [studentData?.data?.id, projectId, fetchMedals]);

  // Gérer les clics en dehors de la carte étendue
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        expandedCardRef.current &&
        !expandedCardRef.current.contains(event.target as Node)
      ) {
        // Vérifier si le clic est sur une autre carte avant de fermer
        const target = event.target as HTMLElement;
        const isClickingOnCard = target.closest("[data-project-card]");

        if (!isClickingOnCard) {
          onToggle?.();
        }
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, onToggle]);

  const handleCardClick = () => {
    // Sur mobile, ouvrir la modale
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setIsModalOpen(true);
    } else {
      // Sur desktop, utiliser l'expansion
      onToggle?.();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Modale pour mobile
  if (isModalOpen) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden "
          onClick={closeModal}
        />

        {/* Modale */}
        <div className="fixed inset-4 bg-white rounded-2xl z-50 lg:hidden overflow-hidden ">
          <div className="flex flex-col h-full">
            {/* Header de la modale */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-xl break-words overflow-hidden">
                  {projectName}
                </h3>
                <p className="text-gray-600 mt-2 break-words overflow-hidden">
                  {description}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 lg:hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                ✕
              </button>
            </div>

            {/* Contenu de la modale */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-[#0E58D8] font-semibold mb-3">
                    Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700">Date de début</p>
                    <p className="font-semibold text-blue-900 text-sm">
                      {details.startDate}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700">Date de fin</p>
                    <p className="font-semibold text-blue-900 text-sm">
                      {details.endDate}
                    </p>
                  </div>
                </div>

                {/* Ressources - Affichées uniquement pour les étudiants */}
                {userRole === "student" && (
                  <div>
                    <h4 className="text-[#0E58D8] font-semibold mb-3">
                      Ressources
                    </h4>
                    <div className="space-y-2">
                      {ressources && ressources.length > 0 ? (
                        ressources.slice(0, 2).map((ressource, i) => {
                          // Parser la ressource si c'est une chaîne JSON
                          const resObj =
                            typeof ressource === "string"
                              ? (() => {
                                  try {
                                    return JSON.parse(ressource);
                                  } catch {
                                    return {};
                                  }
                                })()
                              : ressource;

                          const isValidUrl =
                            resObj?.url &&
                            (resObj.url.startsWith("http") ||
                              resObj.url.startsWith("/"));

                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-sm text-gray-700 truncate block">
                                  {resObj.filename ||
                                    resObj.name ||
                                    `Ressource ${i + 1}`}
                                </span>
                                {resObj.uploaded_at && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Ajouté le{" "}
                                    {new Date(
                                      resObj.uploaded_at
                                    ).toLocaleDateString("fr-FR")}
                                  </p>
                                )}
                              </div>
                              {isValidUrl ? (
                                <a
                                  href={resObj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] text-white text-xs font-medium rounded-lg hover:from-[#0E58D8]/90 hover:to-[#2A6BFF]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer border-0"
                                >
                                  📥 Télécharger
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400 px-3 py-2 bg-gray-100 rounded-lg font-medium">
                                  Indisponible
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          <span className="text-sm text-gray-500">
                            Aucune ressource disponible
                          </span>
                        </div>
                      )}
                      {ressources && ressources.length > 2 && (
                        <div className="text-center pt-2">
                          <span className="text-xs text-gray-400">
                            +{ressources.length - 2} autre(s) ressource(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Médailles - Affichées uniquement pour les étudiants */}
                {userRole === "student" &&
                  (() => {
                    const medalsList = Array.isArray(medals) ? medals : [];

                    if (medalsList.length === 0) {
                      return null;
                    }

                    // Convertir le format des médailles pour l'affichage
                    const displayMedals = medalsList
                      .slice(0, 4)
                      .map((medal: any) => ({
                        name: medal.name || "Médaille",
                        obtained: medal.state === true,
                        description: medal.description || "Médaille du projet",
                      }));

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[#0E58D8] font-semibold">
                            Médailles
                          </h4>
                          <span className="text-xs text-[#0E58D8] bg-blue-50 px-2 py-1 rounded-full font-medium">
                            {medalsList.length} total
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {displayMedals.map((medal, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg"
                            >
                              <FontAwesomeIcon
                                icon={faMedal}
                                className={
                                  medal.obtained
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                              <span className="text-xs text-blue-900 truncate max-w-[120px]">
                                {medal.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {/* Actions */}
                <div>
                  <h4 className="text-[#0E58D8] font-semibold mb-3">Actions</h4>
                  <div className="space-y-3">
                    <Link
                      href={
                        userRole === "admin" || userRole === "advisor"
                          ? `/admin/projects/${projectId}/details`
                          : `/projects/${projectId}/details`
                      }
                    >
                      <button className="w-full px-4 py-2 bg-[#0E58D8] text-white rounded-lg lg:hover:bg-[#0E58D8]/80 transition-colors text-sm cursor-pointer mb-3">
                        Voir les détails
                      </button>
                    </Link>
                    <DevelopmentBadge>
                      <Link href={`/projects/${projectId}/teamBuilder`}>
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-700 transition-colors text-sm cursor-pointer">
                          Équipe
                        </button>
                      </Link>
                    </DevelopmentBadge>
                    {(userRole === "admin" || userRole === "advisor") && (
                      <>
                        <button
                          onClick={onEdit}
                          className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={onDelete}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Carte étendue pour desktop - Style Nexus moderne
  if (isExpanded) {
    return (
      <div
        className="col-span-2 w-full group relative z-20 hidden lg:block"
        ref={expandedCardRef}
        data-project-card
      >
        <div className="border border-[#0E58D8]/20 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header bleu Nexus */}
          <div className="bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] px-6 py-5 text-white flex items-center justify-between">
            <h3 className="text-2xl font-bold truncate">{projectName}</h3>
            <button
              onClick={onToggle}
              className="px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Contenu principal */}
          <div className="bg-white p-6 grid grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-[#0E58D8] font-semibold mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">{description}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-700">Date de début</p>
                  <p className="font-semibold text-blue-900 text-sm">
                    {details.startDate}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-700">Date de fin</p>
                  <p className="font-semibold text-blue-900 text-sm">
                    {details.endDate}
                  </p>
                </div>
              </div>

              {/* Ressources - Affichées uniquement pour les étudiants */}
              {userRole === "student" && (
                <div>
                  <h4 className="text-[#0E58D8] font-semibold mb-2">
                    Ressources
                  </h4>
                  <div className="space-y-2">
                    {ressources && ressources.length > 0 ? (
                      ressources.slice(0, 2).map((ressource, i) => {
                        // Parser la ressource si c'est une chaîne JSON
                        const resObj =
                          typeof ressource === "string"
                            ? (() => {
                                try {
                                  return JSON.parse(ressource);
                                } catch {
                                  return {};
                                }
                              })()
                            : ressource;

                        const isValidUrl =
                          resObj?.url &&
                          (resObj.url.startsWith("http") ||
                            resObj.url.startsWith("/"));

                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-gray-700 truncate block">
                                {resObj.filename ||
                                  resObj.name ||
                                  `Ressource ${i + 1}`}
                              </span>
                              {resObj.uploaded_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Ajouté le{" "}
                                  {new Date(
                                    resObj.uploaded_at
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              )}
                            </div>
                            {isValidUrl ? (
                              <a
                                href={resObj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] text-white text-xs font-medium rounded-lg hover:from-[#0E58D8]/90 hover:to-[#2A6BFF]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer border-0"
                              >
                                📥 Télécharger
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 px-3 py-2 bg-gray-100 rounded-lg font-medium">
                                Indisponible
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <span className="text-sm text-gray-500">
                          Aucune ressource disponible
                        </span>
                      </div>
                    )}
                    {ressources && ressources.length > 2 && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-gray-400">
                          +{ressources.length - 2} autre(s) ressource(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              {/* Médailles - Affichées uniquement pour les étudiants */}
              {userRole === "student" &&
                (() => {
                  const medalsList = Array.isArray(medals) ? medals : [];

                  if (medalsList.length === 0) {
                    return null;
                  }

                  // Convertir le format des médailles pour l'affichage
                  const displayMedals = medalsList
                    .slice(0, 5)
                    .map((medal: any) => ({
                      name: medal.name || "Médaille",
                      obtained: medal.state === true,
                      description: medal.description || "Médaille du projet",
                    }));

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[#0E58D8] font-semibold">
                          Médailles
                        </h4>
                        <span className="text-xs text-[#0E58D8] bg-blue-50 px-2 py-1 rounded-full font-medium">
                          {medalsList.length} total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {displayMedals.map((medal, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg"
                          >
                            <FontAwesomeIcon
                              icon={faMedal}
                              className={
                                medal.obtained
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                            <span className="text-xs text-blue-900 truncate max-w-[120px]">
                              {medal.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* Actions */}
              <div>
                <h4 className="text-[#0E58D8] font-semibold mb-2">Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={
                      userRole === "admin" || userRole === "advisor"
                        ? `/admin/projects/${projectId}/details`
                        : `/projects/${projectId}/details`
                    }
                  >
                    <button className="w-full px-4 py-2 bg-[#0E58D8] text-white rounded-lg hover:bg-[#0E58D8]/90 transition-colors text-sm cursor-pointer">
                      Voir les détails
                    </button>
                  </Link>
                  <DevelopmentBadge>
                    <Link href={`/projects/${projectId}/teamBuilder`}>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer">
                        Équipe
                      </button>
                    </Link>
                  </DevelopmentBadge>
                  {(userRole === "admin" || userRole === "advisor") && (
                    <>
                      <button
                        onClick={onEdit}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={onDelete}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carte normale - Titre, description tronquée et dates
  return (
    <div
      className={`w-full group transition-all duration-300 ${
        isBlurred ? "blur-sm" : ""
      }`}
      data-project-card
    >
      <div
        className="bg-white rounded-2xl p-6 w-full h-[200px] shadow-sm lg:hover:shadow-xl cursor-pointer lg:hover:scale-105 transition-all duration-300 ease-out border border-gray-100 lg:hover:border-[#0E58D8]/30 flex flex-col justify-between"
        onClick={handleCardClick}
      >
        {/* Titre */}
        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-[#0E58D8] mb-2 leading-tight">
            {projectName}
          </h3>

          {/* Description tronquée à 2 lignes */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Dates en bas */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Début: {details.startDate}</span>
          <span>Fin: {details.endDate}</span>
        </div>
      </div>
    </div>
  );
}

export default Cards;
