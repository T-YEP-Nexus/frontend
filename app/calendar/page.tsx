"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Calendar from "@/components/ui/Calendar";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import Header from "@/components/Header/Header";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

const AgendaPlaceholder = () => (
  <div className="w-full h-[500px] bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-2xl text-gray-400 font-bold transition-all duration-300 hover:shadow-2xl">
    (Ici s'affichera l'agenda de l'étudiant)
  </div>
);

const CalendarPage = () => {
  const [selected, setSelected] = useState<"calendrier" | "agenda">(
    "calendrier"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("Tous");
  const filterRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { isLoading: roleLoading } = useRoleRedirect();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  if (roleLoading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="w-full h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 sm:px-12 lg:px-20 py-6 sm:py-8 lg:py-12">
      <Header
        title="Calendrier"
        description="Consultez et gérez vos événements à venir"
      />

      {/* Calendrier ou Agenda */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-transparent flex justify-center">
          <div className="w-full max-w-7xl">
            {isClient && selected === "calendrier" ? (
              <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.005]">
                <Calendar />
              </div>
            ) : (
              <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
                <AgendaPlaceholder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
