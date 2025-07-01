"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Briefcase,
  Folder,
  MessageSquare,
  Edit,
  BookOpen,
} from "lucide-react";

import { Russo_One } from "next/font/google";

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
        </nav>
      </div>
      {/* Utilisateur */}
      <div className="flex flex-col items-center md:flex-row md:items-center gap-2 mt-8">
        <Image
          src="/images/Avatar.png"
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full bg-white"
        />
        <div className="hidden md:flex flex-col">
          <span className="text-white font-bold leading-tight">Valentin</span>
          <span className="text-white/80 text-xs leading-tight">Dupont</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
