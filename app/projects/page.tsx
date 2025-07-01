"use client";

import React, { useState, useRef, useEffect } from "react";
import Cards from "@/components/Projects/Cards";
import { Search, MoreVertical, Bell } from "lucide-react";
import { Russo_One } from "next/font/google";
import { getAllProjects } from "@/lib/projectsData";

const font = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(8);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Récupérer les données depuis le fichier partagé
  const projects = getAllProjects();

  // Filtrer les projets basé sur la recherche
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limiter l'affichage
  const displayedProjects = filteredProjects.slice(0, displayCount);

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredProjects.length));
    // Scroll vers les nouveaux projets ajoutés après un court délai pour laisser le temps au DOM de se mettre à jour
    setTimeout(() => {
      if (projectsGridRef.current && buttonsRef.current) {
        const gridBottom =
          projectsGridRef.current.offsetTop +
          projectsGridRef.current.offsetHeight;
        const buttonsTop = buttonsRef.current.offsetTop;
        const scrollPosition = buttonsTop - window.innerHeight + 100; // 100px d'espace avant les boutons

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleShowLess = () => {
    setDisplayCount(8);
    // Scroll vers la grille de projets après un court délai pour laisser le temps au DOM de se mettre à jour
    setTimeout(() => {
      projectsGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleCardToggle = (projectId: number) => {
    setExpandedCard(expandedCard === projectId ? null : projectId);
  };

  useEffect(() => {
    setExpandedCard(null);
  }, [searchTerm]);

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 sm:mb-12">
        <div>
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white ${font.className} mb-2`}
          >
            Vos Projets
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            Gérez et suivez vos projets en cours
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300">
            <MoreVertical size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300">
            <Bell size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex justify-center mb-8 sm:mb-10 lg:mb-16">
        <div className="relative w-full max-w-sm sm:max-w-md lg:w-96">
          <Search
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-0 bg-white rounded-xl sm:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E58D8] lg:focus:shadow-lg transition-all duration-300 text-gray-700 placeholder:text-gray-400 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Grille de cartes */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-12 auto-rows-fr transition-all duration-300"
        ref={projectsGridRef}
      >
        {displayedProjects.map((project) => (
          <Cards
            key={project.id}
            projectId={project.id}
            projectName={project.name}
            progress={project.progress}
            description={project.description}
            details={project.details}
            deadline={project.deadline}
            documentation={project.documentation}
            tasks={project.tasks}
            trophies={project.trophies}
            isExpanded={expandedCard === project.id}
            onToggle={() => handleCardToggle(project.id)}
            isBlurred={expandedCard !== null && expandedCard !== project.id}
          />
        ))}
      </div>

      {/* Boutons Afficher plus/moins */}
      <div className="flex justify-center gap-6" ref={buttonsRef}>
        {displayedProjects.length < filteredProjects.length && (
          <button
            onClick={handleShowMore}
            className="px-8 py-3 bg-white/20 backdrop-blur-sm cursor-pointer lg:hover:bg-white/30 text-white rounded-xl lg:hover:shadow-lg transition-all duration-300 font-medium border border-white/20"
          >
            Afficher plus
          </button>
        )}
        {displayCount > 8 && (
          <button
            onClick={handleShowLess}
            className="px-8 py-3 bg-white/10 backdrop-blur-sm cursor-pointer lg:hover:bg-white/20 text-white rounded-xl lg:hover:shadow-lg transition-all duration-300 font-medium border border-white/20"
          >
            Afficher moins
          </button>
        )}
      </div>
    </div>
  );
}
