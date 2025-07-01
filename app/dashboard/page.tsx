import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode } from "react";

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
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Contenu principal */}
      <main className="flex-1 ml-4 md:ml-8 pr-4 py-8 w-full">
        <h1 className="text-4xl font-extrabold text-white mb-10 text-left">
          A venir aujourd'hui
        </h1>
        <div className="w-full grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-8 gap-y-6 items-start">
          {/* Colonne principale (gauche) */}
          <div className="flex flex-col gap-6">
            {/* Annonce importante */}
            <section className="bg-white/90 rounded-xl shadow p-6">
              <h2 className="font-bold text-xl text-blue-900 mb-2">
                Annonce importantes
              </h2>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-900">
                  EB
                </div>
                <div>
                  <div className="font-semibold text-blue-900">
                    Enzo Bourdin
                  </div>
                  <div className="text-xs text-blue-800/80">il y a 2h</div>
                </div>
              </div>
              <p className="text-blue-900/80">
                Ceci est une annonce importante pour tous les étudiants. Merci
                de consulter régulièrement cette section pour rester informé des
                dernières actualités.
              </p>
            </section>
            <div className="flex flex-row gap-6">
              {/* Devoirs & rendus */}
              <section className="bg-white/90 rounded-xl shadow p-6 flex-1">
                <h2 className="font-bold text-lg text-blue-900 mb-4">
                  Devoirs & rendus
                </h2>
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
              </section>
              {/* Projets */}
              <section className="bg-white/90 rounded-xl shadow p-6 flex-1">
                <h2 className="font-bold text-lg text-blue-900 mb-4">
                  Projets
                </h2>
                <div className="flex flex-wrap gap-3">
                  <DashboardCard
                    title="T-DEV-500"
                    description="Projet de développement"
                  />
                  <DashboardCard title="T-YOP-700" description="Projet YOP" />
                  <DashboardCard title="T-SEN-700" description="Projet SEN" />
                </div>
              </section>
            </div>
            {/* Rappels & notifications */}
            <section className="bg-white/90 rounded-xl shadow p-6">
              <h2 className="font-bold text-lg text-blue-900 mb-2">
                Rappels & notifications
              </h2>
              <div className="flex flex-wrap gap-3">
                <DashboardCard title="NOUVEAU" description="Document reçu" />
                <DashboardCard title="EMARGEMENT" description="13:00 / 17:15" />
              </div>
            </section>
          </div>
          {/* Colonne droite */}
          <div className="flex flex-col gap-3 h-full">
            {/* Calendrier */}
            <section className="bg-white/90 rounded-xl shadow p-6 min-h-[96px]">
              <h2 className="font-bold text-lg text-blue-900 mb-2">
                Calendrier
              </h2>
              <div className="text-blue-900/80">
                [Widget calendrier à venir]
              </div>
            </section>
            {/* Événements clés */}
            <section className="bg-white/90 rounded-xl shadow p-6 min-h-[96px]">
              <h2 className="font-bold text-lg text-blue-900 mb-2">
                Événements clés
              </h2>
              <div className="flex flex-wrap gap-3">
                <DashboardCard title="T-DEV-600" description="18/06/2025" />
                <DashboardCard
                  title="SUMMER FESTIVAL"
                  description="18/06/2025"
                />
              </div>
            </section>
            {/* Réunions & rendez-vous */}
            <section className="bg-white/90 rounded-xl shadow p-6 min-h-[96px]">
              <h2 className="font-bold text-lg text-blue-900 mb-2">
                Réunions & rendez-vous
              </h2>
              <div className="flex flex-wrap gap-3">
                <DashboardCard title="FOLLOW UP" description="18/06/2025" />
                <DashboardCard
                  title="KICK OFF T-CEN-100"
                  description="18/06/2025"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
