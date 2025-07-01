"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Calendar from "@/components/ui/Calendar";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import Header from "@/components/Header/Header";

const AgendaPlaceholder = () => (
  <div className="w-full h-[500px] bg-white/80 rounded-lg flex items-center justify-center text-2xl text-gray-400 font-bold">
    (Ici s'affichera l'agenda de l'étudiant)
  </div>
);

const legend = [
  { label: "Rappel", color: "bg-blue-400" },
  { label: "Rendez-vous", color: "bg-orange-400" },
  { label: "Disponible", color: "bg-purple-300" },
  { label: "Projet", color: "bg-green-300" },
];

const CalendarPage = () => {
  const [selected, setSelected] = useState<"calendrier" | "agenda">(
    "calendrier"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("Tous");
  const filterRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header
        title="Calendrier"
        description="Consultez et gérez vos événements à venir"
      />
      {/* Calendrier ou Agenda */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-transparent flex justify-center">
          <div className="w-full max-w-5xl">
            {selected === "calendrier" ? <Calendar /> : <AgendaPlaceholder />}
          </div>
        </div>
        {/* Légende */}
        <div className="flex flex-wrap gap-6 mt-8 justify-center">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded ${item.color} block border border-gray-300`}
              ></span>
              <span className="text-white font-semibold text-lg">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
