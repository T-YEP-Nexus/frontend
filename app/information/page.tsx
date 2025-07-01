"use client";
import Header from "@/components/Header/Header";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `il y a ${diff} sec`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

const informations = [
  {
    nom: "Enzo Bourdin",
    avatar: "/images/Avatar.png",
    message: "Ceci est une annonce importante pour tous les étudiants. Merci de consulter régulièrement cette section pour rester informé des dernières actualités.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    nom: "Frençøis Torentino",
    avatar: "/images/Avatar.png",
    message: "N'oubliez pas de valider votre émargement avant 17h15. Toute absence non justifiée sera comptabilisée. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Proin nec massa nec sapien dictum ultricies. Ceci est un texte très long pour tester l'apparition du bouton Plus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Proin nec massa nec sapien dictum ultricies. Encore du texte pour forcer le débordement et vérifier que le bouton Plus s'affiche bien uniquement si le texte est tronqué.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const MIN_LENGTH_FOR_PLUS = 120;

export default function Informations() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header title="Informations Générales" />
      <div className="max-w-4xl mx-auto flex flex-col gap-6 mt-8">
        {informations.map((info, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow flex flex-row items-start px-8 py-6 gap-6 w-full transition-all duration-300 ${isOpen ? "" : "overflow-hidden"}`}
            >
              <Image
                src={info.avatar}
                alt={info.nom}
                width={56}
                height={56}
                className="rounded-full bg-blue-200 mt-1"
              />
              <div className="flex-1 flex flex-col min-w-0 h-full">
                <span className="font-semibold text-blue-900 text-lg leading-tight">
                  {info.nom}
                </span>
                <span className="text-xs text-blue-800/80 mb-2 block">
                  {formatDateTime(info.createdAt)} • {timeAgo(info.createdAt)}
                </span>
                <span className={`text-blue-900/80 text-base mt-2 transition-all duration-300 ${isOpen ? "" : "line-clamp-2"}`}>
                  {info.message}
                </span>
                {info.message.length > MIN_LENGTH_FOR_PLUS && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-4 py-1.5 transition-all text-base flex items-center gap-1 mt-4 self-end w-auto"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    Plus
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
