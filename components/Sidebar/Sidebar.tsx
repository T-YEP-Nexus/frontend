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
  { label: "Emargement", icon: <Edit size={24} />, href: "/emargement" },
  { label: "Absences", icon: <BookOpen size={24} />, href: "/absences" },
];

const russo = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [firstName, setFirstName] = useState("...");
  const [lastName, setLastName] = useState("...");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        const res = await fetch(
          `http://localhost:3004/profile/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok)
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );

        const user = await res.json();
        console.log(user);
        setFirstName(user.data.first_name || "Utilisateur");
        setLastName(user.data.last_name || "");
        setUserRole(user.data.roles_user || "");
      } catch (error) {
        console.error("Erreur : ", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  return (
    <div className="fixed top-0 left-0 h-screen w-20 md:w-64 z-30 flex flex-col justify-between bg-gradient-to-b from-[#1971FF] to-[#1971FF]/80 px-2 md:px-4 py-6 transition-all duration-300">
      {/* Logo + nom */}
      <div>
        <div className="flex flex-col items-center md:flex-row md:items-center gap-2 mb-10">
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
        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-4 py-2 rounded-lg text-white transition-all
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

          {/* Bouton Gestion Utilisateurs (admin seulement) */}
          {userRole === "admin" && (
            <Link
              href="/admin/users/register"
              className={`flex items-center justify-center md:justify-start cursor-pointer text-xl gap-0 md:gap-3 px-0 md:px-4 py-2 rounded-lg text-white transition-all
                ${
                  pathname === "/admin/users/register"
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
          )}
        </nav>
      </div>

      {/* Utilisateur avec données dynamiques */}
      <Link
        href="/profile"
        className={`flex flex-col items-center md:flex-row md:items-center gap-2 mt-8 cursor-pointer p-2 rounded-lg transition-all
          ${
            pathname === "/profile"
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
            {loading ? "..." : firstName}
          </span>
          <span className="text-white/80 text-xs leading-tight">
            {loading ? "..." : lastName}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
