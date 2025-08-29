"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header/Header";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import AdminLoading from "@/components/admin/AdminLoading";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserData } from "@/lib/userData";

function DashboardCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg shadow p-3 min-w-[180px] max-w-full w-full">
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "advisor" | "student" | null>(null);
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
        const finalRole: "admin" | "advisor" | "student" = ["admin", "advisor"].includes(detectedRole)
          ? (detectedRole as any)
          : "student";
        setRole(finalRole);

        // Charger événements
        let fetchedEvents: BackendEvent[] = [];
        if (finalRole === "student") {
          const res = await fetch(`http://localhost:3002/events/student/${userId}`);
          if (res.ok) {
            const json = await res.json();
            fetchedEvents = Array.isArray(json.data) ? json.data : [];
          }
        } else {
          const res = await fetch("http://localhost:3002/events");
          if (res.ok) {
            const json = await res.json();
            fetchedEvents = Array.isArray(json.data) ? json.data : [];
          }
        }
        setEvents(fetchedEvents);

        // Charger projets (liste simple)
        try {
          const pr = await fetch("http://localhost:3003/projects");
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

  // Prochains événements (triés par date, prochains 3)
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    const normalized = events.map((e) => {
      const startIso = e.event_datetime || e.start || null;
      const endIso = e.end || (e.event_datetime && e.duration_minutes ? new Date(new Date(e.event_datetime).getTime() + (e.duration_minutes || 0) * 60000).toISOString() : null);
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

  // Projets simplifiés (3 premiers)
  const topProjects = useMemo(() => {
    return (projects || []).slice(0, 3);
  }, [projects]);

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
        description={role === "student" ? "Vos prochaines échéances" : "Vue d'ensemble de la semaine"}
      />

      <div className="w-full grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
        {/* Colonne principale (gauche) */}
        <div className="flex flex-col gap-6">
          {/* Annonce importante */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h2 className="font-bold text-xl text-blue-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    !
                  </div>
                </div>
                Annonces importantes
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Bienvenue sur votre tableau de bord. Les annonces dynamiques seront bientôt connectées.
              </p>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Devoirs & rendus */}
            <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 flex-1">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <h2 className="font-bold text-lg text-green-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-green-200 to-green-300 rounded-lg">
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  </div>
                  Devoirs & rendus
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <DashboardCard
                    title="À venir"
                    description="Bientôt connecté"
                  />
                </div>
              </div>
            </section>

            {/* Projets */}
            <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 flex-1">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <h2 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg">
                    <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      📁
                    </div>
                  </div>
                  Projets
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {topProjects.length > 0 ? (
                    topProjects.map((p) => (
                      <DashboardCard
                        key={String(p.id)}
                        title={p.title || p.name || `Projet ${p.id}`}
                        description={p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : ""}
                      />
                    ))
                  ) : (
                    <DashboardCard title="Aucun projet" description="Créez ou assignez des projets" />
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Rappels & notifications */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <h2 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg">
                  <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    🔔
                  </div>
                </div>
                Rappels & notifications
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                <DashboardCard title="Calendrier" description={`${weekStats.count} événement(s) cette semaine`} />
              </div>
            </div>
          </section>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">
          {/* Calendrier */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
              <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    📅
                  </div>
                </div>
                Prochains événements
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((ev) => (
                    <DashboardCard
                      key={ev.id}
                      title={ev.title}
                      description={ev.startIso ? new Date(ev.startIso).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : ""}
                    />
                  ))
                ) : (
                  <DashboardCard title="Aucun événement" description="Rien à venir" />
                )}
              </div>
            </div>
          </section>

          {/* Événements clés */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <h2 className="font-bold text-lg text-red-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-red-200 to-red-300 rounded-lg">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ⭐
                  </div>
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

          {/* Réunions & rendez-vous */}
          <section className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
              <h2 className="font-bold text-lg text-teal-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg">
                  <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    👥
                  </div>
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
        </div>
      </div>
    </div>
  );
}
