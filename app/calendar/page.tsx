"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Calendar from "@/components/ui/Calendar";

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
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="max-w-6xl mx-auto pt-12 px-6">
          {/* Header : titre + bouton filtre */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "Russo One, sans-serif" }}
            >
              Calendrier
            </h1>
            <div className="relative" ref={filterRef}>
              <button
                className="px-6 py-2 rounded-lg font-semibold transition-colors border border-[#1971FF] bg-white text-[#1971FF] hover:bg-[#e6f0ff] ml-4 shadow flex items-center gap-2"
                onClick={() => setFilterOpen((o) => !o)}
              >
                Filtrer : <span className="font-bold">{filter}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-[#e6f0ff] rounded-t-lg ${
                      filter === "Mes évènements"
                        ? "bg-[#e6f0ff] font-bold"
                        : ""
                    }`}
                    onClick={() => {
                      setFilter("Mes évènements");
                      setFilterOpen(false);
                    }}
                  >
                    Mes évènements
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-[#e6f0ff] rounded-b-lg ${
                      filter === "Tous" ? "bg-[#e6f0ff] font-bold" : ""
                    }`}
                    onClick={() => {
                      setFilter("Tous");
                      setFilterOpen(false);
                    }}
                  >
                    Tous
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Calendrier ou Agenda */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full bg-transparent flex justify-center">
              <div className="w-full max-w-5xl">
                {selected === "calendrier" ? (
                  <Calendar />
                ) : (
                  <AgendaPlaceholder />
                )}
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
      </div>
    </div>
  );
};

export default CalendarPage;
