"use client";

import React, { useState } from "react";
import { Filter, X, Calendar, Users, Tag } from "lucide-react";

interface CalendarFiltersProps {
  eventTypes: string[];
  selectedEventTypes: string[];
  onEventTypesChange: (types: string[]) => void;
  promotions: { id: string; name: string }[];
  selectedPromotions: string[];
  onPromotionsChange: (promotions: string[]) => void;
  showOnlyMyEvents: boolean;
  onShowOnlyMyEventsChange: (show: boolean) => void;
  onClearFilters: () => void;
  userRole?: "admin" | "advisor" | "student";
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  eventTypes,
  selectedEventTypes,
  onEventTypesChange,
  promotions,
  selectedPromotions,
  onPromotionsChange,
  showOnlyMyEvents,
  onShowOnlyMyEventsChange,
  onClearFilters,
  userRole = "student",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleEventType = (eventType: string) => {
    if (selectedEventTypes.includes(eventType)) {
      onEventTypesChange(
        selectedEventTypes.filter((type) => type !== eventType)
      );
    } else {
      onEventTypesChange([...selectedEventTypes, eventType]);
    }
  };

  const togglePromotion = (promotionId: string) => {
    // Protection supplémentaire : seuls les admins/advisors peuvent utiliser ce filtre
    if (userRole !== "admin" && userRole !== "advisor") {
      console.log("Protection : accès refusé au filtre de promotion");
      return;
    }

    if (selectedPromotions.includes(promotionId)) {
      onPromotionsChange(selectedPromotions.filter((id) => id !== promotionId));
    } else {
      onPromotionsChange([...selectedPromotions, promotionId]);
    }
  };

  const hasActiveFilters =
    selectedEventTypes.length > 0 || selectedPromotions.length > 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 transition-all duration-300 hover:shadow-md ${
        isExpanded ? "min-h-[200px]" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-700">Filtres</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {selectedEventTypes.length + selectedPromotions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              <X size={12} />
              Effacer
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-all duration-200 font-medium"
          >
            {isExpanded ? "Réduire" : "Étendre"}
          </button>
        </div>
      </div>

      {/* Filtres expandables */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Filtre par type d'événement */}
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Types d'événements
            </h4>
            <div className="flex flex-wrap gap-1">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType}
                  onClick={() => toggleEventType(eventType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border-2 cursor-pointer ${
                    selectedEventTypes.includes(eventType)
                      ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm scale-105 ring-2 ring-blue-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 hover:shadow-sm"
                  }`}
                >
                  {eventType}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par promotion - uniquement pour admins/advisors */}
          {(userRole === "admin" || userRole === "advisor") && (
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Promotions
              </h4>
              <div className="flex flex-wrap gap-1">
                {promotions.map((promotion) => (
                  <button
                    key={promotion.id}
                    onClick={() => togglePromotion(promotion.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border-2 cursor-pointer ${
                      selectedPromotions.includes(promotion.id)
                        ? "bg-green-100 text-green-800 border-green-300 shadow-sm scale-105 ring-2 ring-green-200"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:scale-105 hover:shadow-sm"
                    }`}
                  >
                    {promotion.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtre "Mes événements seulement" */}
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Mes événements seulement
              </span>
              <button
                onClick={() => onShowOnlyMyEventsChange(!showOnlyMyEvents)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showOnlyMyEvents ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOnlyMyEvents ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
          {selectedEventTypes.map((type) => (
            <span
              key={type}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium"
            >
              {type}
            </span>
          ))}
          {/* Afficher les promotions uniquement pour admins/advisors */}
          {(userRole === "admin" || userRole === "advisor") &&
            selectedPromotions.map((promoId) => {
              const promo = promotions.find((p) => p.id === promoId);
              return promo ? (
                <span
                  key={promoId}
                  className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium"
                >
                  {promo.name}
                </span>
              ) : null;
            })}
        </div>
      )}
    </div>
  );
};

export default CalendarFilters;
