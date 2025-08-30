"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowDownToLine,
  Download,
} from "lucide-react";
import Link from "next/link";
import { getProjectById } from "@/lib/projectsData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import ResourceSection from "@/components/Projects/Details/Ressources/ResourceSection";
import MainCard from "@/components/Projects/Details/MainCard/MainCard";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";
import { Project, getProjectResources } from "@/lib/projectData";

export default function ProjectDetails({
  params,
}: {
  params: { id: string };
}) {
  // Récupération de l'id depuis les params
  const projectId = parseInt(params.id);

  // Récupération du projet
  const project = getProjectById(projectId) as typeof import("@/lib/projectsData").projects[number] & {
    hotTopics?: { title: string; description: string }[];
    skills?: string[];
  };

  // State pour les ressources
  type ProjectResource = {
    filename: string;
    url: string;
    uploaded_at: string;
  };

  type ProjectData = {
    project_name: string;
    description: string;
    resources: ProjectResource[];
    resources_count: number;
  };

  const [resourcesData, setResourcesData] = React.useState<ProjectData | null>(null);

  React.useEffect(() => {
    const fetchResources = async () => {
      const data = await getProjectResources(params.id);
      setResourcesData(data);
    };

    fetchResources();
  }, [params.id]);
  console.log( "Ressources Data:", resourcesData);
  // État local pour les tâches
  const [tasks, setTasks] = React.useState<string[]>([]);
  const [newTask, setNewTask] = React.useState("");
  const tasksContainerRef = React.useRef<HTMLDivElement>(null);

  // Fonction pour ajouter une tâche
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
      // Scroll vers le bas après l'ajout
      setTimeout(() => {
        if (tasksContainerRef.current) {
          tasksContainerRef.current.scrollTo({
            top: tasksContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Fonction pour supprimer une tâche
  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Projet non trouvé</h1>
          <Link
            href="/projects"
            className="text-white/80 hover:text-white underline"
          >
            Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Circle className="w-5 h-5 text-blue-500" />;
      case "pending":
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Élevé":
        return "text-red-500";
      case "Moyen":
        return "text-yellow-500";
      case "Faible":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-6">
        <div className="flex items-center gap-4 mb-8">
          <ProjectHeader
            title={resourcesData?.project_name}
            description="Détails du projet"
            backIcon={<ArrowLeft size={20} />}
          />
        </div>

        {/* Barre de progression principale */}
        <DevelopmentBadge>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-xl font-semibold">
                  Progression globale
                </h2>
              </div>
              <span className="text-white font-bold text-2xl">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </DevelopmentBadge>
      </div>

      {/* Contenu principal */}
      <div className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description détaillée */}
            <MainCard
              title="Description du projet"
              icon={<FileText className="w-8 h-8 text-blue-400" />}
            >
              <p className="text-gray-600 leading-relaxed">
                {resourcesData?.description}
              </p>
            </MainCard>

            {/* ===================== RESSOURCES DYNAMIQUES ===================== */}
            <MainCard
              title="Ressources"
              icon={<Download className="w-6 h-6 text-blue-400" />}
            >
              {resourcesData?.resources && Array.isArray(resourcesData?.resources) && resourcesData?.resources.length > 0 ? (
                <div className="space-y-2">
                  {resourcesData?.resources.map((resource, index) => {
                    const resObj = typeof resource === "string" ? JSON.parse(resource) : resource;
                    const isValidUrl = resObj.url && (resObj.url.startsWith("http") || resObj.url.startsWith("/"));
                    return (
                      <div
                        key={`resource-${index}-${resObj.filename}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Download className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {resObj.filename || `Ressource ${index + 1}`}
                            </h4>
                          </div>
                        </div>
                        {isValidUrl ? (
                          <a
                            href={resObj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer flex-shrink-0 ml-4"
                            title={`Télécharger ${resObj.filename}`}
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                            Télécharger
                          </a>
                        ) : (
                          <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium flex items-center gap-2 flex-shrink-0 ml-4">
                            <ArrowDownToLine className="w-4 h-4" />
                            Indisponible
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Aucune ressource disponible</p>
                  <p className="text-sm text-gray-400">
                    Les ressources du projet apparaîtront ici une fois ajoutées.
                  </p>
                </div>
              )}
            </MainCard>

            {/* Médailles */}
            <MainCard
              title="Médailles du projet"
              icon={
                <FontAwesomeIcon
                  icon={faMedal}
                  className="w-8 h-8 text-blue-400"
                />
              }
            >
              <span className="text-base font-normal text-gray-500">
                {project.trophies.filter((t) => t.obtained).length}/
                {project.trophies.length}
              </span>
              <div className="grid grid-cols-6 gap-6 mt-4">
                {project.trophies.map((trophy, idx) => (
                  <div
                    key={trophy.name}
                    className="flex flex-col items-center group relative"
                  >
                    <FontAwesomeIcon
                      icon={faMedal}
                      size="2x"
                      className={
                        trophy.obtained
                          ? "text-yellow-400"
                          : "text-gray-300 opacity-40"
                      }
                    />
                    <span className="absolute z-10 bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                      {trophy.description}
                    </span>
                    <span className="text-xs text-gray-700 mt-2 text-center break-words">
                      {trophy.name}
                    </span>
                  </div>
                ))}
              </div>
            </MainCard>

            {/* Hot Topics & Compétences */}
            <MainCard
              title="Hot Topics & Compétences mobilisées"
              icon={<AlertCircle className="w-8 h-8 text-blue-400" />}
            >
              <div className="space-y-4">
                {project.hotTopics && project.hotTopics.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-blue-700 mb-2">
                      Hot Topics
                    </h3>
                    {project.hotTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg mb-2"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold text-yellow-700">
                            {topic.title}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {topic.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {project.skills && project.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">
                      Compétences impliquées
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {project.skills.map((skill, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </MainCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Bloc Tâches & Jalons éditable */}
            <MainCard
              title="Tâches"
              icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            >
              <div className="space-y-4">
                {/* Zone de saisie */}
                <div>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                    placeholder="Tapez une tâche et appuyez sur Entrée..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        addTask();
                      }
                    }}
                  />
                </div>
                {/* Liste des tâches */}
                <div
                  ref={tasksContainerRef}
                  className="space-y-2 max-h-64 overflow-y-auto"
                >
                  {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      Aucune tâche pour le moment
                    </p>
                  ) : (
                    tasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 text-sm flex-1">
                          {task}
                        </span>
                        <button
                          onClick={() => removeTask(index)}
                          className="text-red-400 hover:text-red-600 text-sm font-bold w-6 h-6 rounded-full hover:bg-red-50 transition-all duration-200 cursor-pointer flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </MainCard>
            <MainCard
              title="Informations générales"
              icon={<Users className="w-6 h-6 text-blue-400" />}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-semibold text-gray-800">
                      {project.details.startDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-semibold text-gray-800">
                      {project.details.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Équipe</p>
                    <p className="font-semibold text-gray-800">
                      {project.details.team}
                    </p>
                  </div>
                </div>
              </div>
            </MainCard>
            <MainCard
              title="Deadline"
              icon={<Clock className="w-6 h-6 text-blue-400" />}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Kick off</p>
                  <p className="font-semibold text-gray-800">
                    {project.deadline.kickOff}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Follow up</p>
                  <p className="font-semibold text-gray-800">
                    {project.deadline.followUp}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Keynote</p>
                  <p className="font-semibold text-gray-800">
                    {project.deadline.keynote}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">Jours restants</p>
                  <p className="font-bold text-xl text-blue-600">
                    {project.deadline.daysRemaining} jours
                  </p>
                </div>
              </div>
            </MainCard>
            <MainCard
              title="Équipe"
              icon={<Users className="w-6 h-6 text-blue-400" />}
            >
              <div className="space-y-3">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </MainCard>
          </div>
        </div>
      </div>
    </div>
  );
}