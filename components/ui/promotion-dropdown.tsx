import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, GraduationCap, Loader2 } from "lucide-react";

interface Promotion {
  id: number;
  name: string;
  created_at: string;
}

interface PromotionDropdownProps {
  promotions: Promotion[];
  selectedPromotion: string;
  onPromotionChange: (promotion: string) => void;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const PromotionDropdown: React.FC<PromotionDropdownProps> = ({
  promotions,
  selectedPromotion,
  onPromotionChange,
  loading = false,
  error = null,
  placeholder = "Sélectionner une promotion",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPromotion = (promotionName: string) => {
    onPromotionChange(promotionName);
    setIsOpen(false);
  };

  const selectedPromotionData = promotions.find(
    (p) => p.name === selectedPromotion
  );

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <GraduationCap size={16} className="text-blue-600" />
        Promotion {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-all duration-200 cursor-pointer ${
            disabled || loading
              ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              : error
              ? "border-red-300 focus:ring-red-500 focus:border-red-300"
              : "border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }`}
        >
          <span
            className={selectedPromotion ? "text-gray-900" : "text-gray-500"}
          >
            {selectedPromotion || placeholder}
          </span>

          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {promotions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">
                Aucune promotion disponible
              </div>
            ) : (
              promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  onClick={() => handleSelectPromotion(promotion.name)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900">{promotion.name}</span>
                </div>
              ))
            )}
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default PromotionDropdown;
