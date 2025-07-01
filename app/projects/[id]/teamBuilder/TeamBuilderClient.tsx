"use client";

import { User, Users, Plus, ArrowLeft, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Russo_One } from "next/font/google";
import Link from "next/link";

const font = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

interface Team {
  id: number;
  name: string;
  members: { name: string; avatar: string }[];
  maxMembers: number;
}

interface Project {
  id: number;
  name: string;
  teams?: Team[];
}

export default function TeamBuilderClient({ project }: { project: Project }) {
  // Simuler l'utilisateur courant
  const currentUser = "Bastian CRUVELLIER";

  // Équipes par défaut si aucune n'existe
  const defaultTeams: Team[] = [
    {
      id: 1,
      name: "Groupe A",
      members: [{ name: "William LACROIX", avatar: "👤" }],
      maxMembers: 3,
    },
    {
      id: 2,
      name: "Groupe B",
      members: [{ name: "Paul LOUIS", avatar: "👤" }],
      maxMembers: 3,
    },
    { id: 3, name: "Groupe C", members: [], maxMembers: 3 },
    { id: 4, name: "Groupe D", members: [], maxMembers: 3 },
  ];

  // État local des équipes pour les modifications
  const [teams, setTeams] = useState<Team[]>(project.teams || defaultTeams);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleJoinTeam = (teamId: number) => {
    // Mettre à jour les équipes localement
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          // Vérifier si l'utilisateur n'est pas déjà dans l'équipe
          const isAlreadyMember = team.members.some(
            (member) => member.name === currentUser
          );
          if (!isAlreadyMember && team.members.length < team.maxMembers) {
            return {
              ...team,
              members: [...team.members, { name: currentUser, avatar: "👤" }],
            };
          }
        } else {
          // Retirer l'utilisateur de toutes les autres équipes
          return {
            ...team,
            members: team.members.filter(
              (member) => member.name !== currentUser
            ),
          };
        }
        return team;
      })
    );

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);

    // TODO: Appel API pour sauvegarder en BDD
    // await joinTeam(project.id, teamId, currentUser);
  };

  const closeNotification = () => {
    setShowSuccess(false);
  };

  // Trouver l'équipe actuelle de l'utilisateur
  const currentUserTeam = teams.find((team) =>
    team.members.some((member) => member.name === currentUser)
  );

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      {/* Notification style Apple */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-500 ease-out animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Équipe rejoint
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {teams.find((t) => t.id === currentUserTeam?.id)?.name}
                </p>
              </div>
              <button
                onClick={closeNotification}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {/* Barre de progression */}
            <div className="h-1 bg-gray-100">
              <div className="h-full bg-green-500 transition-all duration-4000 ease-linear animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 sm:mb-12">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${project.id}/details`}
            className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white ${font.className} mb-2`}
            >
              Team Builder
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              {project.name} - Rejoignez une équipe
            </p>
          </div>
        </div>
      </div>

      {/* Règles */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 mb-8 sm:mb-10 lg:mb-16 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          Règles de constitution des équipes
        </h2>
        <ul className="text-gray-700 text-sm sm:text-base space-y-2 list-disc pl-6">
          <li>Vous ne pouvez rejoindre qu'une seule équipe par projet</li>
          <li>Chaque équipe peut contenir jusqu'à 3 membres</li>
          <li>Vous pouvez changer d'équipe jusqu'au 25 mai 2025</li>
          <li>Les équipes incomplètes seront complétées automatiquement</li>
        </ul>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            <strong className="text-gray-800">Deadline :</strong> 25 mai 2025,
            23h59
          </p>
        </div>
      </div>

      {/* Équipe actuelle */}
      {currentUserTeam && (
        <div className="mb-8 bg-blue-50 rounded-xl lg:rounded-2xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Votre équipe actuelle
          </h3>
          <p className="text-blue-700 text-sm sm:text-base">
            Vous êtes membre de l'équipe{" "}
            <strong className="text-blue-800">{currentUserTeam.name}</strong>
          </p>
        </div>
      )}

      {/* Tableau des équipes */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                Groupe
              </th>
              <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                Membres
              </th>
              <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                Places
              </th>
              <th className="py-4 px-6 text-right text-gray-700 font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const isMember = team.members.some((m) => m.name === currentUser);
              const isFull = team.members.length >= team.maxMembers;
              const canJoin = !isMember && !isFull;
              const notEnough = team.members.length < 2;

              return (
                <tr
                  key={team.id}
                  className={`border-b border-gray-100 transition-all duration-300 ${
                    isMember ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-lg font-bold text-gray-800 ${font.className}`}
                      >
                        {team.name}
                      </h3>
                      {notEnough && (
                        <span
                          className="text-yellow-600 text-sm"
                          title="Pas assez de membres"
                        >
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {team.members.length > 0 ? (
                        team.members.map((member, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                              member.name === currentUser
                                ? "bg-blue-100 border-blue-300 text-blue-700"
                                : "bg-gray-100 border-gray-200 text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                member.name === currentUser
                                  ? "bg-blue-300"
                                  : "bg-gray-300"
                              }`}
                            >
                              <User
                                className={`w-3 h-3 ${
                                  member.name === currentUser
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {member.name}
                              {member.name === currentUser && " (Vous)"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 italic text-sm">
                          Aucun membre
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium border border-gray-200">
                        {team.members.length}/{team.maxMembers}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {isMember ? (
                      <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                        ✅ Déjà membre
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                        Complet
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinTeam(team.id)}
                        disabled={!canJoin}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          canJoin
                            ? "bg-[#0E58D8] text-white hover:bg-[#0E58D8]/90 shadow-lg hover:shadow-xl"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Rejoindre
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
