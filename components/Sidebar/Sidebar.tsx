"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  Briefcase,
  Folder,
  MessageSquare,
  Edit,
  BookOpen,
  Users,
  Shield,
  BarChart3,
  GraduationCap,
} from "lucide-react";

import { Russo_One } from "next/font/google";
import { getUserIdFromToken, isTokenExpired } from "@/lib/auth";

const links = [
  { label: "Accueil", icon: <Home size={24} />, href: "/dashboard" },
  { label: "Calendrier", icon: <Calendar size={24} />, href: "/calendar" },
  { label: "Projets", icon: <Briefcase size={24} />, href: "/projects" },
  { label: "Documents", icon: <Folder size={24} />, href: "/documents" },
  {
    label: "Informations",
    icon: <MessageSquare size={24} />,
    href: "/informations",
  },
  //   { label: "Emargement", icon: <Edit size={24} />, href: "/emargement" },
  //   { label: "Absences", icon: <BookOpen size={24} />, href: "/absences" },
];

const russo = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [firstName, setFirstName] = useState("Utilisateur");
  const [lastName, setLastName] = useState("Invité");
  const [userRole, setUserRole] = useState("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour extraire le message d'erreur
  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === "object" && error.message) {
      return error.message;
    }
    return "Erreur inconnue";
  };

  const fetchUserData = async () => {
    try {
      if (isTokenExpired()) {
        router.push("/login");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error(`ID utilisateur introuvable dans le token.${userId}`);
      }

      const res = await fetch(`http://localhost:3004/profile/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(
          "Erreur lors de la récupération des données utilisateur"
        );
      }

      const user = await res.json();
      console.log("Données utilisateur sidebar:", user);

      // Mise à jour des données avec valeurs par défaut si non disponibles
      setFirstName(user.data.first_name || "Utilisateur");
      setLastName(user.data.last_name || "Invité");
      setUserRole(user.data.roles_user || "student");
      setError(null);
    } catch (err) {
      console.error("Erreur : ", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // En cas d'erreur, garder les valeurs par défaut
      setFirstName("Utilisateur");
      setLastName("Invité");
      setUserRole("student");

      // Ne pas rediriger automatiquement vers login en cas d'erreur réseau
      // pour permettre l'utilisation en mode dégradé
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("fetch")
      ) {
        console.log("Mode dégradé: utilisation des données par défaut");
      } else {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchUserData();
  }, [router]);

  // Recharger les données quand on revient sur la page (après modification)
  useEffect(() => {
    const handleFocus = () => {
      // Recharger les données quand la page reprend le focus
      fetchUserData();
    };

    const handleVisibilityChange = () => {
      // Recharger les données quand la page redevient visible
      if (!document.hidden) {
        fetchUserData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Recharger les données quand on navigue vers certaines pages
  useEffect(() => {
    // Recharger les données quand on navigue vers des pages qui pourraient avoir modifié l'utilisateur
    if (
      pathname === "/profile" ||
      pathname === "/admin/profile" ||
      pathname === "/admin/users/dashboard"
    ) {
      fetchUserData();
    }
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 h-screen w-20 md:w-72 z-30 flex flex-col justify-between bg-gradient-to-b from-[#1971FF] to-[#1971FF]/80 px-2 md:px-4 py-6 transition-all duration-300 overflow-hidden">
      {/* Logo + nom */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center md:flex-row md:items-center gap-2 mb-6 md:mb-10">
          <Image
            src="/images/Nexus.png"
            alt="Nexus"
            width={48}
            height={48}
            className="w-12 h-12 md:w-[90px] md:h-[90px]"
          />
          <span
            className={`hidden md:inline text-white font-extrabold text-3xl tracking-wide ${russo.className}`}
          >
            Nexus
          </span>
        </div>

        {/* Liens */}
        <nav className="flex flex-col gap-2 md:gap-4">
          {/* Liens visibles pour tous les utilisateurs sauf advisor/admin */}
          {userRole !== "admin" && userRole !== "advisor" && (
            <>
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                    ${
                      pathname === link.href
                        ? "bg-[#0e357a]/70 font-bold"
                        : "hover:bg-[#0e357a]/40"
                    }
                  `}
                >
                  <span>{link.icon}</span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              ))}
            </>
          )}

          {/* Boutons Admin pour admin et advisor */}
          {(userRole === "admin" || userRole === "advisor") && (
            <>
              <Link
                href="/admin"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/admin"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <BarChart3 size={24} />
                </span>
                <span className="hidden md:inline">Dashboard Admin</span>
              </Link>
              <Link
                href="/admin/users/dashboard"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/admin/users/dashboard"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <Users size={24} />
                </span>
                <span className="hidden md:inline">Gestion Utilisateurs</span>
              </Link>
              <Link
                href="/admin/promotions"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/admin/promotions"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <GraduationCap size={24} />
                </span>
                <span className="hidden md:inline">Gestion Promotions</span>
              </Link>
              <Link
                href="/admin/projects"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/admin/projects"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <Briefcase size={24} />
                </span>
                <span className="hidden md:inline">Gestion Projets</span>
              </Link>
              <Link
                href="/admin/informations"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/admin/informations"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <MessageSquare size={24} />
                </span>
                <span className="hidden md:inline">Gestion Informations</span>
              </Link>

              {/* Calendrier visible pour les advisors et admins (en bas) */}
              <Link
                href="/calendar"
                className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-2 py-2 rounded-lg text-white transition-all
                  ${
                    pathname === "/calendar"
                      ? "bg-[#0e357a]/70 font-bold"
                      : "hover:bg-[#0e357a]/40"
                  }
                `}
              >
                <span>
                  <Calendar size={24} />
                </span>
                <span className="hidden md:inline">Calendrier</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Utilisateur avec données dynamiques */}
      <div className="flex-shrink-0 mt-4 md:mt-8">
        <Link
          href={
            userRole === "admin" || userRole === "advisor"
              ? "/admin/profile"
              : "/profile"
          }
          className={`flex flex-col items-center md:flex-row md:items-center gap-2 cursor-pointer p-2 rounded-lg transition-all
            ${
              (
                userRole === "admin" || userRole === "advisor"
                  ? pathname === "/admin/profile"
                  : pathname === "/profile"
              )
                ? "bg-[#0e357a]/70"
                : "hover:bg-[#0e357a]/40"
            }
          `}
        >
          <Image
            src="/images/Avatar.png"
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full bg-white"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-white font-bold leading-tight">
              {firstName}
            </span>
            <span className="text-white/80 text-xs leading-tight">
              {lastName}
            </span>
            {error && (
              <span className="text-red-200 text-[10px] leading-tight">
                Mode hors ligne
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
