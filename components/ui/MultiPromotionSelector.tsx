"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  year?: number;
}

interface MultiPromotionSelectorProps {
  promotions: Promotion[];
  selectedPromotions: string[];
  onPromotionsChange: (promotionIds: string[]) => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
  maxSelections?: number;
}

const MultiPromotionSelector: React.FC<MultiPromotionSelectorProps> = ({
  promotions,
  selectedPromotions,
  onPromotionsChange,
  loading = false,
  error,
  placeholder = "Sélectionner des promotions",
  required = false,
  maxSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promotion.year && promotion.year.toString().includes(searchTerm))
  );

  const handlePromotionToggle = (promotionId: string) => {
    if (selectedPromotions.includes(promotionId)) {
      onPromotionsChange(selectedPromotions.filter(id => id !== promotionId));
    } else {
      if (maxSelections && selectedPromotions.length >= maxSelections) {
        return; // Ne pas dépasser le maximum
      }
      onPromotionsChange([...selectedPromotions, promotionId]);
    }
  };

  const removePromotion = (promotionId: string) => {
    onPromotionsChange(selectedPromotions.filter(id => id !== promotionId));
  };

  const getSelectedPromotionNames = () => {
    return selectedPromotions
      .map(id => promotions.find(p => p.id === id)?.name)
      .filter(Boolean);
  };

  const isMaxReached = maxSelections ? selectedPromotions.length >= maxSelections : false;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[44px] px-3 py-2 text-left bg-blue-50 border border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors duration-200 ${
            error ? "border-red-300 bg-red-50" : ""
          } ${required && selectedPromotions.length === 0 ? "border-orange-300 bg-orange-50" : ""}`}
          disabled={loading}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 min-h-[20px]">
              {selectedPromotions.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                getSelectedPromotionNames().map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-lg"
                  >
                    {name}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removePromotion(selectedPromotions[index]);
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200 cursor-pointer"
                    >
                      <X size={12} />
                    </span>
                  </span>
                ))
              )}
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Rechercher une promotion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredPromotions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Aucune promotion trouvée
              </div>
            ) : (
              filteredPromotions.map((promotion) => {
                const isSelected = selectedPromotions.includes(promotion.id);
                const isDisabled = !isSelected && isMaxReached;
                
                return (
                  <button
                    key={promotion.id}
                    type="button"
                    onClick={() => handlePromotionToggle(promotion.id)}
                    disabled={isDisabled}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between ${
                      isSelected ? "bg-blue-50 text-blue-900" : "text-gray-700"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="font-medium">{promotion.name}</span>
                      {promotion.year && (
                        <span className="text-sm text-gray-500">({promotion.year})</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {maxSelections && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
              {selectedPromotions.length}/{maxSelections} promotions sélectionnées
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {required && selectedPromotions.length === 0 && !error && (
        <p className="mt-1 text-sm text-orange-600">
          Veuillez sélectionner au moins une promotion
        </p>
      )}
    </div>
  );
};

export default MultiPromotionSelector;
