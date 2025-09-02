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
      onEventTypesChange(selectedEventTypes.filter(type => type !== eventType));
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
      onPromotionsChange(selectedPromotions.filter(id => id !== promotionId));
    } else {
      onPromotionsChange([...selectedPromotions, promotionId]);
    }
  };

  const hasActiveFilters = selectedEventTypes.length > 0 || selectedPromotions.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres du calendrier</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {selectedEventTypes.length + selectedPromotions.length} actifs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X size={16} />
              Effacer
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? "Réduire" : "Étendre"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Filtre par type d'événement */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Types d'événements
            </h4>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType}
                  onClick={() => toggleEventType(eventType)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedEventTypes.includes(eventType)
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {eventType}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par promotion - uniquement pour admins/advisors */}
          {(userRole === "admin" || userRole === "advisor") && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Promotions
              </h4>
              <div className="flex flex-wrap gap-2">
                {promotions.map((promotion) => (
                  <button
                    key={promotion.id}
                    onClick={() => togglePromotion(promotion.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedPromotions.includes(promotion.id)
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {promotion.name}
                  </button>
                ))}
              </div>
            </div>
          )}


        </div>
      )}

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {selectedEventTypes.map((type) => (
            <span key={type} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Type: {type}
            </span>
          ))}
          {/* Afficher les promotions uniquement pour admins/advisors */}
          {(userRole === "admin" || userRole === "advisor") && selectedPromotions.map((promoId) => {
            const promo = promotions.find(p => p.id === promoId);
            return promo ? (
              <span key={promoId} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Promo: {promo.name}
              </span>
            ) : null;
          })}

        </div>
      )}
    </div>
  );
};

export default CalendarFilters;
