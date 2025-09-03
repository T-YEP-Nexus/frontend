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
  UserCheck,
  Menu,
  X,
  ChevronRight,
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
  {
    label: "Trombinoscope",
    icon: <UserCheck size={24} />,
    href: "/trombinoscope",
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
  const [userPromotion, setUserPromotion] = useState("");
  const [userCampus, setUserCampus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  // Fonction pour traduire les rôles en français
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "advisor":
        return "Conseiller";
      case "student":
        return "Étudiant";
      default:
        return role;
    }
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
      setUserCampus(user.data.campus || "");

      // Récupérer les données étudiant si c'est un étudiant
      if (user.data.roles_user === "student") {
        try {
          const studentRes = await fetch(
            `http://localhost:3004/student/profile/${user.data.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (studentRes.ok) {
            const studentData = await studentRes.json();
            console.log("Données étudiant dans sidebar:", studentData);
            console.log("Données étudiant complètes:", studentData.data);
            console.log(
              "ID promotion étudiant:",
              studentData.data?.id_promotion
            );
            console.log(
              "Toutes les propriétés de studentData.data:",
              Object.keys(studentData.data || {})
            );

            // Récupérer toutes les promotions pour convertir l'ID en nom
            const promotionsRes = await fetch(
              "http://localhost:3004/promotions"
            );
            if (promotionsRes.ok) {
              const promotionsData = await promotionsRes.json();
              console.log(
                "Promotions disponibles dans sidebar:",
                promotionsData
              );

              // Fonction pour récupérer le nom de promotion par ID
              const getPromotionNameById = (promotionId: string): string => {
                if (!promotionsData.success || !promotionId) return "";
                const promotion = promotionsData.data.find(
                  (p: { id: string; name: string }) => p.id === promotionId
                );
                console.log(
                  "Recherche promotion pour ID:",
                  promotionId,
                  "Résultat:",
                  promotion
                );
                return promotion ? promotion.name : "";
              };

              // Convertir l'ID de promotion en nom
              const promotionId = studentData.data?.id_promotion;
              console.log("ID promotion à convertir:", promotionId);
              const promotionName = getPromotionNameById(promotionId);
              console.log("Nom de promotion trouvé:", promotionName);
              setUserPromotion(promotionName);
            }
          }
        } catch (studentError) {
          console.error(
            "Erreur lors de la récupération des données étudiant:",
            studentError
          );
        }
      }

      setError(null);
    } catch (err) {
      console.error("Erreur : ", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // En cas d'erreur, garder les valeurs par défaut
      setFirstName("Utilisateur");
      setLastName("Invité");
      setUserRole("student");
      setUserPromotion("");
      setUserCampus("");

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

  // Fermer le menu mobile/tablette lors d'un changement de route et via Échap
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Header mobile/tablette */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 w-full bg-[#0E58D8] h-14 grid grid-cols-3 items-center px-4">
        <div className="flex items-center">
          <button
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm shadow-sm transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/images/Nexus.png"
            alt="Nexus"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </div>
        <div className="flex items-center justify-end">
          <span
            className={`text-white font-extrabold text-xl tracking-wide ${russo.className}`}
          >
            Nexus
          </span>
        </div>
      </div>
      {/* Espace sous le header pour décaler le contenu (mobile/tablette) */}
      <div className="lg:hidden h-14" />

      {/* Sidebar desktop (sticky dans la colonne grid) */}
      <div
        className={`hidden lg:flex sticky top-0 h-[100dvh] w-fit z-30 flex-col justify-between bg-gradient-to-b from-[#1971FF] to-[#1971FF]/80 px-4 py-6 overflow-hidden`}
      >
        {/* Logo + nom */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={`flex flex-col items-center md:flex-row md:items-center gap-2 mb-6 md:mb-10${
              userRole === "student" ? " md:-ml-3" : ""
            }`}
          >
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
          <nav className="flex flex-col gap-2 md:gap-4 px-1">
            {/* Liens visibles pour tous les utilisateurs sauf advisor/admin */}
            {userRole !== "admin" && userRole !== "advisor" && (
              <>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === link.href
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                  >
                    <span className="shrink-0 transition-transform group-hover:scale-110">
                      {link.icon}
                    </span>
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
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/admin"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <BarChart3 size={24} />
                  </span>
                  <span className="hidden md:inline">Dashboard Admin</span>
                </Link>
                <Link
                  href="/admin/users/dashboard"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/admin/users/dashboard"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <Users size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Utilisateurs</span>
                </Link>
                <Link
                  href="/admin/promotions"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/admin/promotions"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <GraduationCap size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Promotions</span>
                </Link>
                <Link
                  href="/admin/projects"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/admin/projects"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <Briefcase size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Projets</span>
                </Link>
                <Link
                  href="/admin/informations"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/admin/informations"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <MessageSquare size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Informations</span>
                </Link>

                {/* Calendrier visible pour les advisors et admins (en bas) */}
                <Link
                  href="/calendar"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/calendar"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <Calendar size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Calendrier</span>
                </Link>
                <Link
                  href="/documents"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/documents"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <Folder size={24} />
                  </span>
                  <span className="hidden md:inline">Gestion Documents</span>
                </Link>
                <Link
                  href="/trombinoscope"
                  className={`group flex items-center justify-center md:justify-start cursor-pointer text-lg md:text-xl gap-4 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                    ${
                      pathname === "/trombinoscope"
                        ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                        : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <UserCheck size={24} />
                  </span>
                  <span className="hidden md:inline">Trombinoscope</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Utilisateur avec données dynamiques (desktop) */}
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
                {firstName} {lastName}
              </span>
              <span className="text-white/80 text-xs leading-tight">
                {userRole === "student"
                  ? userPromotion || "Promotion non définie"
                  : getRoleLabel(userRole) + " " + userCampus ||
                    "Campus non défini"}
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

      {/* Backdrop + panneau coulissant (mobile/tablette) */}
      <div
        className={`lg:hidden fixed left-0 right-0 top-14 bottom-0 z-30 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panneau coulissant */}
        <div
          className={`absolute top-0 left-0 h-full w-full bg-[#0E58D8] px-2 md:px-4 py-6 transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex-1 overflow-y-auto">
              {/* Liens */}
              <nav className="mt-2 flex-1 flex flex-col">
                {userRole !== "admin" && userRole !== "advisor" && (
                  <>
                    {links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                          ${
                            pathname === link.href
                              ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                              : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                          }
                        `}
                      >
                        <span className="justify-self-start flex items-center">
                          <span className="shrink-0 transition-transform group-hover:scale-110">
                            {link.icon}
                          </span>
                        </span>
                        <span className="justify-self-center inline whitespace-nowrap">
                          {link.label}
                        </span>
                        <span className="justify-self-end w-6" />
                      </Link>
                    ))}
                  </>
                )}

                {(userRole === "admin" || userRole === "advisor") && (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/admin"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <BarChart3 size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Dashboard Admin
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/admin/users/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/admin/users/dashboard"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <Users size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Utilisateurs
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/admin/promotions"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/admin/promotions"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <GraduationCap size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Promotions
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/admin/projects"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/admin/projects"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <Briefcase size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Projets
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/admin/informations"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/admin/informations"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <MessageSquare size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Informations
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/calendar"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/calendar"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <Calendar size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Calendrier
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/documents"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/documents"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <Folder size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Gestion Documents
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                    <Link
                      href="/trombinoscope"
                      onClick={() => setIsOpen(false)}
                      className={`group grid grid-cols-3 items-center text-center cursor-pointer text-lg md:text-xl gap-2 px-3 md:px-3 py-3 rounded-xl text-white transition-all
                        ${
                          pathname === "/trombinoscope"
                            ? "bg-[#0e357a]/70 font-semibold shadow-inner"
                            : "hover:bg-[#0e357a]/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <span className="justify-self-start flex items-center">
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          <UserCheck size={24} />
                        </span>
                      </span>
                      <span className="justify-self-center inline whitespace-nowrap">
                        Trombinoscope
                      </span>
                      <span className="justify-self-end w-6" />
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Bloc utilisateur (mobile) */}
            <div className="mt-4 md:mt-8 flex flex-col items-center justify-center">
              <Link
                href={
                  userRole === "admin" || userRole === "advisor"
                    ? "/admin/profile"
                    : "/profile"
                }
                onClick={() => setIsOpen(false)}
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
                <div className="flex flex-col max-lg:items-center">
                  <span className="text-white font-bold leading-tight">
                    {firstName} {lastName}
                  </span>
                  <span className="text-white/80 text-xs leading-tight">
                    {userRole === "student"
                      ? userPromotion || "Promotion non définie"
                      : getRoleLabel(userRole) + " " + userCampus ||
                        "Campus non défini"}
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
        </div>
      </div>
    </>
  );
};

export default Sidebar;
