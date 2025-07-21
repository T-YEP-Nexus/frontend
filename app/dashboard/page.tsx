import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode } from "react";
import Header from "@/components/Header/Header";

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

export default function Dashboard() {
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center font-bold text-blue-900 shadow-md">
                  EB
                </div>
                <div>
                  <div className="font-semibold text-blue-900">
                    Enzo Bourdin
                  </div>
                  <div className="text-xs text-blue-600">il y a 2h</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Ceci est une annonce importante pour tous les étudiants. Merci
                de consulter régulièrement cette section pour rester informé des
                dernières actualités.
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
                    title="Maths"
                    description="DM à rendre le 15/04"
                  />
                  <DashboardCard
                    title="Anglais"
                    description="Rédaction à finir"
                  />
                  <DashboardCard title="Physique" description="TP à préparer" />
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
                  <DashboardCard
                    title="T-DEV-500"
                    description="Projet de développement"
                  />
                  <DashboardCard title="T-YOP-700" description="Projet YOP" />
                  <DashboardCard title="T-SEN-700" description="Projet SEN" />
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
                <DashboardCard title="NOUVEAU" description="Document reçu" />
                <DashboardCard title="EMARGEMENT" description="13:00 / 17:15" />
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
                Calendrier
              </h2>
            </div>
            <div className="p-6">
              <div className="text-gray-700 text-sm">
                [Widget calendrier à venir]
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
                <DashboardCard title="T-DEV-600" description="18/06/2025" />
                <DashboardCard
                  title="SUMMER FESTIVAL"
                  description="18/06/2025"
                />
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
                <DashboardCard title="FOLLOW UP" description="18/06/2025" />
                <DashboardCard
                  title="KICK OFF T-CEN-100"
                  description="18/06/2025"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
