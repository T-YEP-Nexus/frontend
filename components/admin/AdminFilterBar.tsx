import React from "react";
import { Search, Filter, ChevronDown, Loader2 } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface AdminFilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedPromotion: string;
  setSelectedPromotion: (v: string) => void;
  promotions: string[];
  promotionsLoading?: boolean;
  selectedSecond: string;
  setSelectedSecond: (v: string) => void;
  seconds: (string | FilterOption)[];
  secondLabel: string;
  secondPlaceholder: string;
  promotionDropdownRef: React.RefObject<HTMLDivElement | null>;
  secondDropdownRef: React.RefObject<HTMLDivElement | null>;
  promotionDropdownOpen: boolean;
  setPromotionDropdownOpen: (v: boolean) => void;
  secondDropdownOpen: boolean;
  setSecondDropdownOpen: (v: boolean) => void;
}

export default function AdminFilterBar({
  searchTerm,
  setSearchTerm,
  selectedPromotion,
  setSelectedPromotion,
  promotions,
  promotionsLoading = false,
  selectedSecond,
  setSelectedSecond,
  seconds,
  secondLabel,
  secondPlaceholder,
  promotionDropdownRef,
  secondDropdownRef,
  promotionDropdownOpen,
  setPromotionDropdownOpen,
  secondDropdownOpen,
  setSecondDropdownOpen,
}: AdminFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-blue-200/50">
      <h2 className="font-bold text-2xl text-blue-900 mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
          <Filter className="w-6 h-6 text-blue-600" />
        </div>
        Filtres et recherche
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Barre de recherche */}
        <div className="relative group">
          <Search
            className="absolute left-4 z-10 top-1/2 transform -translate-y-1/2 text-blue-700 group-focus-within:text-blue-600 transition-colors duration-200"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-300"
          />
        </div>

        {/* Filtre par promotion */}
        <div className="relative" ref={promotionDropdownRef}>
          <div
            onClick={() =>
              !promotionsLoading &&
              setPromotionDropdownOpen(!promotionDropdownOpen)
            }
            className={`flex items-center justify-between px-4 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] ${
              promotionsLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <span
              className={
                selectedPromotion === "all"
                  ? "text-blue-400"
                  : "text-blue-900 font-medium"
              }
            >
              {selectedPromotion === "all"
                ? "Toutes les promotions"
                : selectedPromotion}
            </span>
            {promotionsLoading ? (
              <Loader2 size={18} className="text-blue-400 animate-spin" />
            ) : (
              <ChevronDown
                size={18}
                className={`text-blue-400 transition-transform duration-300 ${
                  promotionDropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
          {promotionDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              <div
                onClick={() => {
                  setSelectedPromotion("all");
                  setPromotionDropdownOpen(false);
                }}
                className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 first:rounded-t-xl"
              >
                <span className="text-blue-900 font-medium">
                  Toutes les promotions
                </span>
              </div>
              {promotions.map((promo) => (
                <div
                  key={promo}
                  onClick={() => {
                    setSelectedPromotion(promo);
                    setPromotionDropdownOpen(false);
                  }}
                  className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                >
                  <span className="text-blue-900">{promo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtre secondaire (étudiant, rôle, etc.) */}
        <div className="relative" ref={secondDropdownRef}>
          <div
            onClick={() => setSecondDropdownOpen(!secondDropdownOpen)}
            className="flex items-center justify-between px-4 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <span
              className={
                selectedSecond === "all"
                  ? "text-blue-400"
                  : "text-blue-900 font-medium"
              }
            >
              {selectedSecond === "all"
                ? secondPlaceholder
                : (() => {
                    const selectedRole = seconds.find((role) =>
                      typeof role === "string"
                        ? role === selectedSecond
                        : role.value === selectedSecond
                    );
                    return typeof selectedRole === "string"
                      ? selectedRole
                      : selectedRole?.label || selectedSecond;
                  })()}
            </span>
            <ChevronDown
              size={18}
              className={`text-blue-400 transition-transform duration-300 ${
                secondDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          {secondDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              <div
                onClick={() => {
                  setSelectedSecond("all");
                  setSecondDropdownOpen(false);
                }}
                className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 first:rounded-t-xl"
              >
                <span className="text-blue-900 font-medium">
                  {secondPlaceholder}
                </span>
              </div>
              {seconds.map((item) => {
                const value = typeof item === "string" ? item : item.value;
                const label = typeof item === "string" ? item : item.label;

                return (
                  <div
                    key={value}
                    onClick={() => {
                      setSelectedSecond(value);
                      setSecondDropdownOpen(false);
                    }}
                    className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                  >
                    <span className="text-blue-900">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
