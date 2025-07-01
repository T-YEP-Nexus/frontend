"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  noMargin?: boolean;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Rechercher...",
  className,
  noMargin = false,
}: SearchBarProps) {
  return (
    <div
      className={`flex justify-center ${
        noMargin ? "" : "mb-8 sm:mb-10 lg:mb-16"
      } ${className || ""}`}
    >
      <div className="relative w-full max-w-sm sm:max-w-md lg:w-96">
        <Search
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"
          size={18}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-0 bg-white rounded-xl sm:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E58D8] lg:focus:shadow-lg transition-all duration-300 text-gray-700 placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
