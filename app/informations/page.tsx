"use client";
import Header from "@/components/Header/Header";
import { ChevronDown, User, Clock, Calendar, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getActiveInformations,
  type InformationWithCreator,
} from "@/lib/informationsData";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import AdminLoading from "@/components/admin/AdminLoading";

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
const INITIAL_DISPLAY_COUNT = 6;

export default function Informations() {
  const { isLoading: roleLoading } = useRoleRedirect();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [informations, setInformations] = useState<InformationWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_DISPLAY_COUNT);

  useEffect(() => {
    const loadInformations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const activeInformations = await getActiveInformations();
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

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + INITIAL_DISPLAY_COUNT);
  };

  const displayedInformations = informations.slice(0, displayedCount);
  const hasMore = displayedCount < informations.length;

  // Afficher un loader pendant la vérification du rôle
  if (roleLoading) {
    return <AdminLoading message="Vérification des droits d'accès..." />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Informations Générales" />
        <div className="max-w-6xl mx-auto flex items-center justify-center mt-6 sm:mt-8">
          <AdminLoading message="Chargement des informations..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
        <Header title="Informations Générales" />
        <div className="max-w-6xl mx-auto flex items-center justify-center mt-6 sm:mt-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header title="Informations Générales" />

      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 mt-6 sm:mt-8">
        {informations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-200/50">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📢</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Aucune information disponible
            </h3>
            <p className="text-gray-600">
              Aucune information active n'est disponible pour le moment.
            </p>
          </div>
        ) : (
          <>
            {displayedInformations.map((info, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={info.id}
                  className={`group bg-white rounded-2xl shadow-lg border border-blue-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
                    isOpen ? "" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start px-4 sm:px-8 py-4 sm:py-6 gap-4 sm:gap-6 w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <User className="text-blue-700" size={20} />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0 h-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <span className="font-bold text-blue-900 text-base sm:text-xl leading-tight break-words">
                          {info.creator_full_name || "Inconnu"}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Clock size={14} />
                          <span className="whitespace-nowrap">
                            {timeAgo(info.created_at)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-blue-900 text-lg sm:text-xl mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent break-words">
                        {info.title}
                      </h3>

                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 mb-4">
                        <span
                          className={`text-blue-800 text-sm sm:text-base leading-relaxed transition-all duration-300 break-words ${
                            isOpen ? "" : "line-clamp-3"
                          }`}
                        >
                          {info.message}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Calendar size={14} />
                          <span className="whitespace-nowrap">
                            {formatDateTime(info.created_at)}
                          </span>
                        </div>

                        {info.message.length > MIN_LENGTH_FOR_PLUS && (
                          <button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl px-4 sm:px-6 py-2 transition-all duration-300 text-sm flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl self-start sm:self-auto"
                            onClick={() => setOpenIdx(isOpen ? null : idx)}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "Voir moins" : "Voir plus"}
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  onClick={handleShowMore}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl px-6 sm:px-8 py-3 transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Afficher plus d'informations
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
