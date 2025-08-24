"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode, useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import AdminLoading from "@/components/admin/AdminLoading";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
} from "lucide-react";
import {
  getActiveInformations,
  type InformationWithCreator,
} from "@/lib/informationsData";
import { useCalendarData } from "@/hooks/useCalendarData";

function DashboardCard({
  title,
  description,
  icon,
  onClick,
  isClickable = false,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-lg shadow p-3 min-w-[180px] max-w-full w-full transition-all duration-200 ${
        isClickable ? "hover:shadow-md hover:scale-105 cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {icon && <div className="text-blue-700 text-2xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="font-semibold text-blue-900 text-base leading-tight">
          {title}
        </span>
        <span className="text-blue-800/80 text-xs leading-tight">
          {description}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isLoading } = useRoleRedirect();
  const router = useRouter();

  // États pour les annonces récentes
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    InformationWithCreator[]
  >([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<
    number | null
  >(null);

  // États pour les événements du jour
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [todayEventsLoading, setTodayEventsLoading] = useState(true);

  // Utiliser le hook pour récupérer les projets
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchActiveProjects,
  } = useProjectsData();

  // Utiliser le hook pour récupérer les événements
  const {
    events: allEvents,
    loading: eventsLoading,
    fetchAllEvents,
  } = useCalendarData();

  // Transformer les données du backend vers le format attendu par DashboardCard
  const transformProjectData = (project: any) => {
    // Calculer la progression basée sur les ressources ou autres critères
    const progress = project.ressources
      ? Math.min(project.ressources.length * 10, 100)
      : 0;

    return {
      id: project.id,
      name: project.name,
      progress: progress,
      description: project.description,
    };
  };

  // Récupérer les 3 premiers projets actifs
  const dashboardProjects = projects.slice(0, 3).map(transformProjectData);

  // Fonction pour formater le temps écoulé
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `il y a ${diff} sec`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return `il y a ${Math.floor(diff / 86400)} j`;
  };

  // Fonction pour filtrer les événements du jour
  const getTodayEvents = (events: any[]) => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    return events
      .filter((event) => {
        const eventDate = new Date(event.event_datetime);
        return eventDate >= todayStart && eventDate < todayEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.event_datetime).getTime() -
          new Date(b.event_datetime).getTime()
      );
  };

  // Charger les projets, annonces et événements au montage du composant
  useEffect(() => {
    const loadData = async () => {
      // Charger les projets
      fetchActiveProjects();

      // Charger les événements
      try {
        setTodayEventsLoading(true);
        await fetchAllEvents();
      } catch (err) {
        console.error("Erreur lors du chargement des événements:", err);
      } finally {
        setTodayEventsLoading(false);
      }

      // Charger les annonces récentes
      try {
        setAnnouncementsLoading(true);
        const activeInformations = await getActiveInformations();
        // Prendre les 5 dernières annonces
        const recent = activeInformations.slice(0, 5);
        setRecentAnnouncements(recent);
      } catch (err) {
        console.error("Erreur lors du chargement des annonces:", err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadData();
  }, []);

  // Défilement automatique des annonces toutes les 10 secondes
  useEffect(() => {
    if (recentAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) =>
        prev === recentAnnouncements.length - 1 ? 0 : prev + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [recentAnnouncements.length]);

  // Réinitialiser l'expansion quand on change d'annonce
  useEffect(() => {
    setExpandedAnnouncement(null);
  }, [currentAnnouncementIndex]);

  // Mettre à jour les événements du jour quand les événements changent
  useEffect(() => {
    if (!eventsLoading && allEvents.length > 0) {
      const today = getTodayEvents(allEvents);
      setTodayEvents(today);
    }
  }, [allEvents, eventsLoading]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}/details`);
  };

  const handleViewAllProjects = () => {
    router.push("/projects");
  };

  const handlePreviousAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) =>
      prev === 0 ? recentAnnouncements.length - 1 : prev - 1
    );
  };

  const handleNextAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) =>
      prev === recentAnnouncements.length - 1 ? 0 : prev + 1
    );
  };

  // Fonction pour formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour obtenir la couleur selon le type d'événement
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "#10b981"; // vert émeraude
      case "kick-off":
        return "#f59e0b"; // orange
      case "keynote":
        return "#8b5cf6"; // violet
      case "hub-talk":
        return "#06b6d4"; // cyan
      case "other":
        return "#3b82f6"; // bleu
      default:
        return "#6b7280"; // gris
    }
  };

  const MIN_LENGTH_FOR_PLUS = 120;
  const currentAnnouncement = recentAnnouncements[currentAnnouncementIndex];
  const isExpanded = expandedAnnouncement === currentAnnouncementIndex;
  const shouldShowExpandButton =
    currentAnnouncement?.message &&
    currentAnnouncement.message.length > MIN_LENGTH_FOR_PLUS;

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return <AdminLoading message="Vérification des droits d'accès..." />;
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <Header
        title="Tableau de bord"
        description="Vue d'ensemble de votre journée"
      />

      <div className="w-full grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
        {/* Colonne principale (gauche) */}
        <div className="flex flex-col gap-6">
          {/* Annonces récentes */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h2 className="font-bold text-xl text-blue-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                </div>
                Annonces récentes
              </h2>
            </div>
            <div className="p-6">
              {announcementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Chargement des annonces...</span>
                  </div>
                </div>
              ) : recentAnnouncements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📢</div>
                  <p className="text-gray-600">Aucune annonce récente</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Annonce actuelle avec transition */}
                  <div
                    key={currentAnnouncementIndex}
                    className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-2"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center font-bold text-blue-900 shadow-md">
                        {currentAnnouncement?.creator_full_name?.charAt(0) ||
                          "A"}
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">
                          {currentAnnouncement?.creator_full_name || "Anonyme"}
                        </div>
                        <div className="text-xs text-blue-600">
                          {timeAgo(currentAnnouncement?.created_at || "")}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-blue-900 text-lg mb-3">
                      {currentAnnouncement?.title}
                    </h3>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 mb-4">
                      <span
                        className={`text-blue-800 text-sm sm:text-base leading-relaxed break-words transition-all duration-300 ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {currentAnnouncement?.message}
                      </span>
                    </div>

                    {/* Bouton Voir plus/moins */}
                    {shouldShowExpandButton && (
                      <div className="flex justify-start mb-4">
                        <button
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl px-4 py-2 transition-all duration-300 text-sm flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl"
                          onClick={() =>
                            setExpandedAnnouncement(
                              isExpanded ? null : currentAnnouncementIndex
                            )
                          }
                        >
                          {isExpanded ? "Voir moins" : "Voir plus"}
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contrôles de navigation */}
                  {recentAnnouncements.length > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {recentAnnouncements.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentAnnouncementIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentAnnouncementIndex
                                ? "bg-blue-600"
                                : "bg-blue-300 hover:bg-blue-400"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handlePreviousAnnouncement}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                        >
                          <ChevronLeft className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={handleNextAnnouncement}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                        >
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Devoirs & rendus */}
            <div className="flex-1">
              <DevelopmentBadge>
                <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 w-full">
                  <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                    <h2 className="font-bold text-lg text-green-900 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-green-200 to-green-300 rounded-lg">
                        <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                      </div>
                      Devoirs & rendus
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                      <DashboardCard
                        title="Maths"
                        description="DM à rendre le 15/04"
                      />
                      <DashboardCard
                        title="Anglais"
                        description="Rédaction à finir"
                      />
                      <DashboardCard
                        title="Physique"
                        description="TP à préparer"
                      />
                    </div>
                  </div>
                </section>
              </DevelopmentBadge>
            </div>

            {/* Projets */}
            <div className="flex-1">
              <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg">
                        <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                      </div>
                      Projets
                    </h2>
                    <button
                      onClick={handleViewAllProjects}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Voir plus
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">
                          Chargement des projets...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {dashboardProjects.map((project) => (
                        <DashboardCard
                          key={project.id}
                          title={project.name}
                          description={`${project.progress}% terminé`}
                          onClick={() => handleProjectClick(project.id)}
                          isClickable={true}
                        />
                      ))}
                      {dashboardProjects.length === 0 && (
                        <DashboardCard
                          title="Aucun projet"
                          description="Aucun projet actif"
                        />
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Rappels & notifications */}
          <DevelopmentBadge>
            <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <h2 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg">
                    <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                  </div>
                  Rappels & notifications
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <DashboardCard title="NOUVEAU" description="Document reçu" />
                  <DashboardCard
                    title="EMARGEMENT"
                    description="13:00 / 17:15"
                  />
                </div>
              </div>
            </section>
          </DevelopmentBadge>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Calendrier */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                  </div>
                  Calendrier du jour
                </h2>
                <div className="text-sm text-indigo-600 font-medium">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
            </div>
            <div className="p-6">
              {todayEventsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">
                      Chargement des événements...
                    </span>
                  </div>
                </div>
              ) : todayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Aucun événement aujourd'hui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                      style={{
                        borderLeftColor: getEventColor(event.event_type),
                        borderLeftWidth: "4px",
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getEventColor(event.event_type),
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            {formatTime(event.event_datetime)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {todayEvents.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-indigo-600">
                        +{todayEvents.length - 3} autres événements
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Événements clés */}
          <DevelopmentBadge>
            <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <h2 className="font-bold text-lg text-red-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-red-200 to-red-300 rounded-lg">
                    <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                  </div>
                  Événements clés
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <DashboardCard title="T-DEV-600" description="18/06/2025" />
                  <DashboardCard
                    title="SUMMER FESTIVAL"
                    description="18/06/2025"
                  />
                </div>
              </div>
            </section>
          </DevelopmentBadge>

          {/* Réunions & rendez-vous */}
          <DevelopmentBadge>
            <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
                <h2 className="font-bold text-lg text-teal-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg">
                    <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                  </div>
                  Réunions & rendez-vous
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <DashboardCard title="FOLLOW UP" description="18/06/2025" />
                  <DashboardCard
                    title="KICK OFF T-CEN-100"
                    description="18/06/2025"
                  />
                </div>
              </div>
            </section>
          </DevelopmentBadge>
        </div>
      </div>
    </div>
  );
}
