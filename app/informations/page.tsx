"use client";
import Header from "@/components/Header/Header";
import Image from "next/image";
import { ChevronDown, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getActiveInformations,
  type Information,
} from "@/lib/informationsData";

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
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} - ${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

const MIN_LENGTH_FOR_PLUS = 120;

export default function Informations() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [informations, setInformations] = useState<Information[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInformations = () => {
      setIsLoading(true);
      setError(null);

      try {
        const activeInformations = getActiveInformations();
        setInformations(activeInformations);
      } catch (err) {
        console.error("Erreur lors du chargement des informations:", err);
        setError("Erreur lors du chargement des informations");
      } finally {
        setIsLoading(false);
      }
    };

    loadInformations();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Informations Générales" />
        <div className="max-w-6xl mx-auto flex items-center justify-center mt-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des informations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Informations Générales" />
        <div className="max-w-6xl mx-auto flex items-center justify-center mt-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header title="Informations Générales" />
      <div className="max-w-6xl mx-auto flex flex-col gap-6 mt-8">
        {informations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune information disponible
            </h3>
            <p className="text-gray-600">
              Aucune information active n'est disponible pour le moment.
            </p>
          </div>
        ) : (
          informations.map((info, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={info.id}
                className={`bg-white rounded-2xl shadow flex flex-row items-start px-8 py-6 gap-6 w-full transition-all duration-300 ${
                  isOpen ? "" : "overflow-hidden"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg mt-1">
                  <User className="text-blue-700" size={24} />
                </div>
                <div className="flex-1 flex flex-col min-w-0 h-full">
                  <span className="font-semibold text-blue-900 text-lg leading-tight mb-2">
                    {info.author}
                  </span>
                  <span className="text-xs text-blue-800/80 mb-2 block">
                    {formatDateTime(info.createdAt)} • {timeAgo(info.createdAt)}
                  </span>
                  <h3 className="font-semibold text-blue-900 text-lg mb-2">
                    {info.title}
                  </h3>
                  <span
                    className={`text-blue-900/80 text-base mt-2 transition-all duration-300 ${
                      isOpen ? "" : "line-clamp-2"
                    }`}
                  >
                    {info.content}
                  </span>
                  {info.content.length > MIN_LENGTH_FOR_PLUS && (
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-4 py-1.5 transition-all text-base flex items-center gap-1 mt-4 self-end w-auto"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      Plus
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
