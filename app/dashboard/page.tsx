"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header/Header";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import AdminLoading from "@/components/admin/AdminLoading";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserData } from "@/lib/userData";
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
  Megaphone,
  Wallet,
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
      className={`flex items-center gap-3 bg-white rounded-lg shadow p-3 min-w-[180px] max-w-full w-full ${
        isClickable
          ? "hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-102"
          : ""
      }`}
      onClick={isClickable ? onClick : undefined}
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

interface BackendEvent {
  id: number;
  title: string;
  event_datetime?: string;
  duration_minutes?: number;
  start?: string;
  end?: string;
  description?: string;
  event_type?: string;
  location?: string;
}

interface BackendProject {
  id: number | string;
  title?: string;
  name?: string;
  created_at?: string;
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

  // États pour les événements du jour (vue condensée)
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [todayEventsLoading, setTodayEventsLoading] = useState(true);

  // Projets (actifs) via hook
  const {
    projects: activeProjects,
    loading: projectsLoading,
    error: projectsError,
    fetchActiveProjects,
  } = useProjectsData();

  // Événements globaux via hook (pour panneau "Calendrier du jour")
  const {
    events: allEvents,
    loading: eventsLoading,
    fetchAllEvents,
  } = useCalendarData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "advisor" | "student" | null>(
    null
  );
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [projects, setProjects] = useState<BackendProject[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = getUserIdFromToken();
        if (!userId) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        // Rôle via userData util (déjà robuste aux profils sans données student)
        const user = await getUserData(userId);
        const detectedRole = (user.role || "student").toLowerCase();
        const finalRole: "admin" | "advisor" | "student" = [
          "admin",
          "advisor",
        ].includes(detectedRole)
          ? (detectedRole as any)
          : "student";
        setRole(finalRole);

        // Charger événements
        let fetchedEvents: BackendEvent[] = [];
        if (finalRole === "student") {
          const res = await fetch(
            `http://localhost:3002/events/student/${userId}`,
            {
              credentials: "include",
            }
          );
          if (res.ok) {
            const json = await res.json();
            fetchedEvents = Array.isArray(json.data) ? json.data : [];
          }
        } else {
          const res = await fetch("http://localhost:3002/events", {
            credentials: "include",
          });
          if (res.ok) {
            const json = await res.json();
            fetchedEvents = Array.isArray(json.data) ? json.data : [];
          }
        }
        setEvents(fetchedEvents);

        // Charger projets (liste simple)
        try {
          const pr = await fetch("http://localhost:3003/projects", {
            credentials: "include",
          });
          if (pr.ok) {
            const pj = await pr.json();
            setProjects(Array.isArray(pj.data) ? pj.data : []);
          } else {
            setProjects([]);
          }
        } catch {
          setProjects([]);
        }
      } catch (e: any) {
        setError(e?.message || "Erreur de chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Charger projets actifs, annonces et événements globaux pour le panneau droit
  useEffect(() => {
    const loadData = async () => {
      // Projets actifs
      fetchActiveProjects();

      // Événements globaux (utilisés pour le "Calendrier du jour")
      try {
        setTodayEventsLoading(true);
        await fetchAllEvents();
      } catch (err) {
        console.error("Erreur lors du chargement des événements:", err);
      } finally {
        setTodayEventsLoading(false);
      }

      // Annonces récentes
      try {
        setAnnouncementsLoading(true);
        const activeInformations = await getActiveInformations();
        const recent = activeInformations.slice(0, 5);
        setRecentAnnouncements(recent);
      } catch (err) {
        console.error("Erreur lors du chargement des annonces:", err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Défilement auto des annonces
  useEffect(() => {
    if (recentAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) =>
        prev === recentAnnouncements.length - 1 ? 0 : prev + 1
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [recentAnnouncements.length]);

  // Réinitialiser l'expansion quand l'annonce change
  useEffect(() => {
    setExpandedAnnouncement(null);
  }, [currentAnnouncementIndex]);

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
        if (!event.event_datetime) return false;
        const eventDate = new Date(event.event_datetime);
        return eventDate >= todayStart && eventDate < todayEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.event_datetime).getTime() -
          new Date(b.event_datetime).getTime()
      );
  };

  // Mettre à jour les événements du jour à partir des événements de la promotion
  useEffect(() => {
    if (!loading && events.length > 0) {
      const today = getTodayEvents(events);
      setTodayEvents(today);
    }
  }, [events, loading]);

  // Prochains événements (triés par date, prochains 3)
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    const normalized = events.map((e) => {
      const startIso = e.event_datetime || e.start || null;
      const endIso =
        e.end ||
        (e.event_datetime && e.duration_minutes
          ? new Date(
              new Date(e.event_datetime).getTime() +
                (e.duration_minutes || 0) * 60000
            ).toISOString()
          : null);
      const startTs = startIso ? new Date(startIso).getTime() : NaN;
      return { ...e, startIso, endIso, startTs };
    });
    return normalized
      .filter((e) => !isNaN(e.startTs) && e.startTs >= now)
      .sort((a, b) => a.startTs - b.startTs)
      .slice(0, 3);
  }, [events]);

  // Stats calendrier (semaine courante)
  const weekStats = useMemo(() => {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // lundi début de semaine
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const inWeek = events.filter((e) => {
      const iso = e.event_datetime || e.start;
      if (!iso) return false;
      const d = new Date(iso);
      return d >= startOfWeek && d < endOfWeek;
    });
    return { count: inWeek.length };
  }, [events]);

  // Projets simplifiés (3 premiers) à partir de la liste complète
  const topProjects = useMemo(() => {
    return (projects || []).slice(0, 3);
  }, [projects]);

  // Transformer et limiter les projets actifs pour la section "Projets"
  const transformProjectData = (project: any) => {
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
  const dashboardProjects = (activeProjects || [])
    .slice(0, 3)
    .map(transformProjectData);

  if (isLoading || loading) {
    return <AdminLoading message="Chargement du tableau de bord..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Erreur de chargement</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <Header
        title="Tableau de bord"
        description={
          role === "student"
            ? "Vos prochaines échéances"
            : "Vue d'ensemble de la semaine"
        }
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
                  <div
                    key={currentAnnouncementIndex}
                    className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-2"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center font-bold text-blue-900 shadow-md">
                        {recentAnnouncements[
                          currentAnnouncementIndex
                        ]?.creator_full_name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">
                          {recentAnnouncements[currentAnnouncementIndex]
                            ?.creator_full_name || "Anonyme"}
                        </div>
                        <div className="text-xs text-blue-600">
                          {(() => {
                            const date =
                              recentAnnouncements[currentAnnouncementIndex]
                                ?.created_at || "";
                            const now = new Date();
                            const d = new Date(date);
                            const diff = Math.floor(
                              (now.getTime() - d.getTime()) / 1000
                            );
                            if (diff < 60) return `il y a ${diff} sec`;
                            if (diff < 3600)
                              return `il y a ${Math.floor(diff / 60)} min`;
                            if (diff < 86400)
                              return `il y a ${Math.floor(diff / 3600)} h`;
                            return `il y a ${Math.floor(diff / 86400)} j`;
                          })()}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-blue-900 text-lg mb-3">
                      {recentAnnouncements[currentAnnouncementIndex]?.title}
                    </h3>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 mb-4">
                      <span
                        className={`text-blue-800 text-sm sm:text-base leading-relaxed break-words transition-all duration-300 ${
                          expandedAnnouncement === currentAnnouncementIndex
                            ? ""
                            : "line-clamp-3"
                        }`}
                      >
                        {recentAnnouncements[currentAnnouncementIndex]?.message}
                      </span>
                    </div>

                    {recentAnnouncements[currentAnnouncementIndex]?.message &&
                      recentAnnouncements[currentAnnouncementIndex]!.message
                        .length > 120 && (
                        <div className="flex justify-start mb-4">
                          <button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl px-4 py-2 transition-all duration-300 text-sm flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                            onClick={() =>
                              setExpandedAnnouncement(
                                expandedAnnouncement ===
                                  currentAnnouncementIndex
                                  ? null
                                  : currentAnnouncementIndex
                              )
                            }
                          >
                            {expandedAnnouncement === currentAnnouncementIndex
                              ? "Voir moins"
                              : "Voir plus"}
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 ${
                                expandedAnnouncement ===
                                currentAnnouncementIndex
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      )}
                  </div>

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
                          onClick={() =>
                            setCurrentAnnouncementIndex((prev) =>
                              prev === 0
                                ? recentAnnouncements.length - 1
                                : prev - 1
                            )
                          }
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentAnnouncementIndex((prev) =>
                              prev === recentAnnouncements.length - 1
                                ? 0
                                : prev + 1
                            )
                          }
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 cursor-pointer"
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
            {/* <div className="flex-1">
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
                      <DashboardCard title="Maths" description="DM à rendre le 15/04" />
                      <DashboardCard title="Anglais" description="Rédaction à finir" />
                      <DashboardCard title="Physique" description="TP à préparer" />
                    </div>
                  </div>
                </section>
              </DevelopmentBadge>
            </div> */}

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
                      onClick={() => router.push("/projects")}
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
                          onClick={() =>
                            router.push(`/projects/${project.id}/details`)
                          }
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
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Calendrier du jour */}
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
              {loading ? (
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
                        borderLeftColor: ((): string => {
                          switch (event.event_type) {
                            case "follow-up":
                              return "#10b981";
                            case "kick-off":
                              return "#f59e0b";
                            case "keynote":
                              return "#8b5cf6";
                            case "hub-talk":
                              return "#06b6d4";
                            case "other":
                              return "#3b82f6";
                            default:
                              return "#6b7280";
                          }
                        })(),
                        borderLeftWidth: "4px",
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: ((): string => {
                              switch (event.event_type) {
                                case "follow-up":
                                  return "#10b981";
                                case "kick-off":
                                  return "#f59e0b";
                                case "keynote":
                                  return "#8b5cf6";
                                case "hub-talk":
                                  return "#06b6d4";
                                case "other":
                                  return "#3b82f6";
                                default:
                                  return "#6b7280";
                              }
                            })(),
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            {new Date(event.event_datetime).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
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
                      <button
                        onClick={() => router.push("/calendar")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 cursor-pointer"
                      >
                        +{todayEvents.length - 3} autres événements
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <h2 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg">
                  <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold"></div>
                </div>
                Vue d'ensemble
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Calendrier - Événements de la semaine */}
                <DashboardCard
                  title="Cette semaine"
                  description={`${weekStats.count} événement(s) programmé(s)`}
                  icon={<Calendar className="w-5 h-5" />}
                  onClick={() => router.push("/calendar")}
                  isClickable={true}
                />

                {/* Projets actifs */}
                <DashboardCard
                  title="Projets actifs"
                  description={`${dashboardProjects.length} projet(s) en cours`}
                  icon={<Megaphone className="w-5 h-5" />}
                  onClick={() => router.push("/projects")}
                  isClickable={true}
                />

                {/* Prochain événement */}
                <DashboardCard
                  title="Prochain événement"
                  description={
                    upcomingEvents.length > 0
                      ? upcomingEvents[0]?.title || "Aucun événement"
                      : "Aucun événement"
                  }
                  icon={<Clock className="w-5 h-5" />}
                  onClick={() => router.push("/calendar")}
                  isClickable={true}
                />

                {/* Nouvelles annonces */}
                <DashboardCard
                  title="Annonces"
                  description={`${recentAnnouncements.length} annonce(s) récente(s)`}
                  icon={<Wallet className="w-5 h-5" />}
                  onClick={() => router.push("/informations")}
                  isClickable={true}
                />
              </div>
            </div>
          </section>

          {/* Événements clés */}
          {/* <DevelopmentBadge>
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
                  {upcomingEvents.map((ev) => (
                    <DashboardCard
                      key={ev.id}
                      title={ev.title}
                      description={ev.startIso ? new Date(ev.startIso).toLocaleDateString("fr-FR") : ""}
                    />
                  ))}
                </div>
              </div>
            </section>
          </DevelopmentBadge> */}

          {/* Réunions & rendez-vous */}
          {/* <DevelopmentBadge>
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
                  {upcomingEvents.slice(0, 2).map((ev) => (
                    <DashboardCard
                      key={`meet-${ev.id}`}
                      title={ev.title}
                      description={ev.startIso ? new Date(ev.startIso).toLocaleString("fr-FR") : ""}
                    />
                  ))}
                  {upcomingEvents.length === 0 && (
                    <DashboardCard title="Aucun rendez-vous" description="Planifiez vos suivis" />
                  )}
                </div>
              </div>
            </section>
          </DevelopmentBadge> */}
        </div>
      </div>
    </div>
  );
}
