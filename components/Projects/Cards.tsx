"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

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
  trophies?: { name: string; obtained: boolean; description: string }[];
  isExpanded?: boolean;
  onToggle?: () => void;
  isBlurred?: boolean;
  projectId?: number; // Ajout de l'ID du projet pour la navigation
}

function Cards({
  projectName,
  progress = 75,
  description,
  details,
  tasks,
  deadline,
  documentation,
  trophies = [],
  isExpanded = false,
  onToggle,
  isBlurred = false,
  projectId,
}: CardsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredTrophy, setHoveredTrophy] = useState<number | null>(null);

  // S'assurer que la progression est entre 0 et 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Déterminer la couleur de la barre selon la progression
  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Déterminer le statut selon la progression
  const getStatusText = (progress: number) => {
    if (progress === 0) return "Aucune progression";
    if (progress <= 20) return "Commencement";
    if (progress <= 40) return "En cours";
    if (progress <= 60) return "Développement";
    if (progress <= 80) return "Finalisation";
    return "Terminé";
  };

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
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={closeModal}
        />

        {/* Modale */}
        <div className="fixed inset-4 bg-white rounded-2xl z-50 lg:hidden overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header de la modale */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-xl">
                  {projectName}
                </h3>
                <p className="text-gray-600 mt-2">{description}</p>
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
                {/* Détails du projet */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Détails du projet
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Date de début: {details.startDate}</p>
                    <p>• Date de fin prévue: {details.endDate}</p>
                    <p>• Équipe: {details.team}</p>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Deadline</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Kick off: {deadline.kickOff}</p>
                    <p>• Follow up: {deadline.followUp}</p>
                    <p>• Keynote: {deadline.keynote}</p>
                    <p>• Jours restants: {deadline.daysRemaining} jours</p>
                  </div>
                </div>

                {/* Documentation */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Documentation
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-center text-gray-500">
                        📄 {documentation.pdfName}
                      </p>
                      <p className="text-center text-xs text-gray-400 mt-1">
                        Lien vers la documentation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tâches récentes */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Tâches récentes
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {tasks.map((task, index) => (
                      <p key={index}>• {task}</p>
                    ))}
                  </div>
                </div>

                {/* Statistiques */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Statistiques
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progression globale
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {clampedProgress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                          clampedProgress
                        )}`}
                        style={{ width: `${clampedProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Statut actuel */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Statut actuel
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(clampedProgress)}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${getProgressColor(
                        clampedProgress
                      )}`}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Actions</h4>
                  <div className="space-y-2">
                    <Link href={`/projects/${projectId}/details`}>
                      <button className="w-full px-4 py-2 bg-[#0E58D8] text-white rounded-lg lg:hover:bg-[#0E58D8]/80 transition-colors text-sm cursor-pointer">
                        Voir les détails
                      </button>
                    </Link>
                    <Link href={`/projects/${projectId}/teamBuilder`}>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-700 transition-colors text-sm cursor-pointer">
                        Mon équipe
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Carte étendue pour desktop
  if (isExpanded) {
    return (
      <div className="col-span-2 row-span-2 w-full group relative z-20 hidden lg:block">
        <div className="bg-white rounded-2xl p-8 w-full h-full shadow-2xl lg:hover:shadow-3xl transition-all duration-300 ease-out border border-gray-100 lg:hover:border-[#0E58D8]/30">
          <div className="flex flex-col h-full">
            {/* Header de la carte étendue */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2 text-2xl lg:group-hover:text-[#0E58D8] transition-colors duration-300">
                  {projectName}
                </h3>
                <p className="text-gray-600 text-lg">{description}</p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 lg:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenu étendu */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Détails du projet
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Date de début: {details.startDate}</p>
                    <p>• Date de fin prévue: {details.endDate}</p>
                    <p>• Équipe: {details.team}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Deadline</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Kick off: {deadline.kickOff}</p>
                    <p>• Follow up: {deadline.followUp}</p>
                    <p>• Keynote: {deadline.keynote}</p>
                    <p>• Jours restants: {deadline.daysRemaining} jours</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Documentation
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-center text-gray-500">
                        📄 {documentation.pdfName}
                      </p>
                      <p className="text-center text-xs text-gray-400 mt-1">
                        Lien vers la documentation
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Tâches récentes
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {tasks.map((task, index) => (
                      <p key={index}>• {task}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Statistiques
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progression globale
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {clampedProgress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                          clampedProgress
                        )}`}
                        style={{ width: `${clampedProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Statut actuel
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(clampedProgress)}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${getProgressColor(
                        clampedProgress
                      )}`}
                    ></div>
                  </div>
                </div>

                {/* Aperçu des médailles */}
                {trophies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Médailles du projet
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Progression des trophées
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {trophies.filter((t) => t.obtained).length}/
                          {trophies.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {trophies.slice(0, 12).map((trophy, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div className="relative">
                              <FontAwesomeIcon
                                icon={faMedal}
                                size="lg"
                                className={`${
                                  trophy.obtained
                                    ? "text-yellow-400"
                                    : "text-gray-300 opacity-40"
                                }`}
                                onMouseEnter={() => setHoveredTrophy(index)}
                                onMouseLeave={() => setHoveredTrophy(null)}
                              />
                              {/* Tooltip */}
                              {hoveredTrophy === index && (
                                <span className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs pointer-events-none whitespace-nowrap shadow-lg">
                                  {trophy.description}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {trophies.length > 12 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{trophies.length - 12} autres trophées
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Link href={`/projects/${projectId}/details`}>
                      <button className="w-full px-4 py-2 bg-[#0E58D8] text-white rounded-lg lg:hover:bg-[#0E58D8]/80 transition-colors text-sm cursor-pointer">
                        Voir les détails
                      </button>
                    </Link>
                    <Link href={`/projects/${projectId}/teamBuilder`}>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-700 transition-colors text-sm cursor-pointer">
                        Mon équipe
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carte normale
  return (
    <div
      className={`w-full group transition-all duration-300 ${
        isBlurred ? "blur-sm" : ""
      }`}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full h-76 shadow-sm lg:hover:shadow-xl cursor-pointer lg:hover:scale-105 transition-all duration-300 ease-out border border-gray-100 lg:hover:border-[#0E58D8]/30 relative"
        onClick={handleCardClick}
      >
        <div className="flex flex-col h-full">
          {/* Header de la carte */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-4 text-xl lg:group-hover:text-[#0E58D8] transition-colors duration-300">
              {projectName}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
          </div>

          {/* Section progression */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {getStatusText(clampedProgress)}
              </span>
              <span className="text-sm font-bold text-gray-800">
                {clampedProgress}%
              </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                  clampedProgress
                )}`}
                style={{ width: `${clampedProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
