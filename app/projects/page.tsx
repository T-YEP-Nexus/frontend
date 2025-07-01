"use client";

import React, { useState, useRef, useEffect } from "react";
import Cards from "@/components/Projects/Cards";
import SearchBar from "@/components/SearchBar/SearchBar";
import { getAllProjects } from "@/lib/projectsData";
import Header from "@/components/Header/Header";
import ShowMoreLessButtons from "@/components/ShowMoreLessButtons/ShowMoreLessButtons";

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
      <Header
        title="Vos Projets"
        description="Gérez et suivez vos projets en cours"
      />

      {/* Barre de recherche */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
            placeholder="Rechercher un projet..."
          />

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
      <ShowMoreLessButtons
        showMoreVisible={displayedProjects.length < filteredProjects.length}
        showLessVisible={displayCount > 8}
        onShowMore={handleShowMore}
        onShowLess={handleShowLess}
        buttonsRef={buttonsRef}
      />
    </div>
  );
}
