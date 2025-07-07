"use client";

import React, { useState, useRef, useEffect } from "react";
import Cards from "@/components/Projects/Cards";
import SearchBar from "@/components/SearchBar/SearchBar";
import Header from "@/components/Header/Header";
import ShowMoreLessButtons from "@/components/ShowMoreLessButtons/ShowMoreLessButtons";
import { useProjectsData } from "@/hooks/useProjectsData";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(8);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'my-projects'>('active');
  const projectsGridRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Utiliser le hook pour récupérer les projets
  const { 
    projects, 
    loading, 
    error, 
    fetchActiveProjects,
    fetchProjectsByStudent
  } = useProjectsData();

  // Transformer les données du backend vers le format attendu par Cards
  const transformProjectData = (project: any) => {
    // Calculer la progression basée sur les ressources ou autres critères
    const progress = project.ressources ? Math.min(project.ressources.length * 10, 100) : 0;
    
    // Calculer les jours restants (exemple basé sur la date de création)
    const createdDate = new Date(project.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysSinceCreation); // Exemple: 30 jours de projet

    return {
      id: project.id,
      name: project.name,
      progress: progress,
      description: project.description,
      details: {
        startDate: new Date(project.created_at).toLocaleDateString('fr-FR'),
        endDate: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        team: "Équipe à définir" // À adapter selon vos besoins
      },
      deadline: {
        kickOff: new Date(project.created_at).toLocaleDateString('fr-FR'),
        followUp: new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        keynote: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        daysRemaining: daysRemaining
      },
      documentation: {
        pdfUrl: project.ressources?.[0]?.url || "#",
        pdfName: project.ressources?.[0]?.filename || "Documentation.pdf"
      },
      tasks: [
        "Analyser les besoins",
        "Concevoir l'architecture",
        "Développer les fonctionnalités",
        "Tester l'application"
      ],
      trophies: [
        { name: "Premier commit", obtained: progress > 0, description: "Premier commit réalisé" },
        { name: "Architecture validée", obtained: progress > 20, description: "Architecture du projet validée" },
        { name: "MVP terminé", obtained: progress > 50, description: "Version minimale viable terminée" },
        { name: "Tests passants", obtained: progress > 80, description: "Tous les tests passent" },
        { name: "Projet livré", obtained: progress === 100, description: "Projet entièrement livré" }
      ]
    };
  };

  // Filtrer et transformer les projets
  const transformedProjects = projects.map(transformProjectData);
  const filteredProjects = transformedProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limiter l'affichage
  const displayedProjects = filteredProjects.slice(0, displayCount);

  // Changer de vue
  const handleViewModeChange = async (mode: 'active' | 'my-projects') => {
    setViewMode(mode);
    setSearchTerm("");
    setDisplayCount(8);
    setExpandedCard(null);
    
    if (mode === 'active') {
      await fetchActiveProjects();
    } else {
      await fetchProjectsByStudent();
    }
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredProjects.length));
    setTimeout(() => {
      if (projectsGridRef.current && buttonsRef.current) {
        const gridBottom =
          projectsGridRef.current.offsetTop +
          projectsGridRef.current.offsetHeight;
        const buttonsTop = buttonsRef.current.offsetTop;
        const scrollPosition = buttonsTop - window.innerHeight + 100;
        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleShowLess = () => {
    setDisplayCount(8);
    setTimeout(() => {
      projectsGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleCardToggle = (projectId: string) => {
    setExpandedCard(expandedCard === projectId ? null : projectId);
  };

  useEffect(() => {
    setExpandedCard(null);
  }, [searchTerm]);

  // Gestion du loading et de l'erreur
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 text-lg">Chargement des projets...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Erreur lors du chargement des projets : {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <Header
        title="Vos Projets"
        description="Gérez et suivez vos projets en cours"
      />

      {/* Boutons de vue */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => handleViewModeChange('active')}
          variant={viewMode === 'active' ? 'default' : 'outline'}
          className="flex-1 sm:flex-none"
        >
          Projets Actifs
        </Button>
        <Button
          onClick={() => handleViewModeChange('my-projects')}
          variant={viewMode === 'my-projects' ? 'default' : 'outline'}
          className="flex-1 sm:flex-none"
        >
          Mes Projets
        </Button>
      </div>

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
