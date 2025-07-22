import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface Slot {
  start: string;
  end: string;
  user: string | null;
}

interface ModalEventRegistrationProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    start?: Date | string;
    end?: Date | string;
    event_type?: string;
    description?: string;
    slots?: Slot[];
  } | null;
  isRegistered: boolean;
  onRegister: (eventId: number, slotIndex?: number) => Promise<void>;
  onUnregister: (eventId: number) => Promise<void>;
}

const ModalEventRegistration: React.FC<ModalEventRegistrationProps> = ({
  open,
  onClose,
  event,
  isRegistered,
  onRegister,
  onUnregister,
}) => {
  const [loading, setLoading] = useState<number | null>(null); // index du créneau en cours d'inscription
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegisterSlot = async (slotIdx: number) => {
    if (!event) return;
    setLoading(slotIdx);
    setError(null);
    try {
      await onRegister(Number(event.id), slotIdx);
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(null);
    }
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-md w-full sm:w-[700px] max-w-[98vw] mx-4 shadow-2xl border border-white/20 overflow-x-hidden max-h-[95vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">S'inscrire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Informations de l'événement */}
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg">{event.title}</span>
            </div>
            {event.start && (
              <div className="flex items-center gap-2 text-blue-800 text-base mb-1">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="4"
                    fill="#e0e7ff"
                  />
                  <path
                    stroke="#1971FF"
                    strokeWidth="2"
                    d="M8 2v4M16 2v4M3 10h18"
                  />
                </svg>
                <span>{formatDate(event.start)}</span>
              </div>
            )}
            {event.description && (
              <p className="text-base text-blue-900/80 mt-1">
                {event.description}
              </p>
            )}
          </div>

          {/* Liste des créneaux disponibles */}
          {Array.isArray(event.slots) && event.slots.length > 0 && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="font-semibold text-blue-900 mb-2">
                Créneaux disponibles :
              </div>
              <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                {event.slots.map((slot, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-blue-800 text-sm bg-white rounded-xl px-3 py-2"
                  >
                    <span className="flex-1">
                      {new Date(slot.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(slot.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {slot.user ? (
                      <span className="text-xs text-blue-700 font-semibold">
                        {slot.user}
                      </span>
                    ) : (
                      <button
                        className="px-4 py-1 bg-blue-400 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-500 hover:shadow-lg transition-all duration-200 text-sm"
                        onClick={() => handleRegisterSlot(idx)}
                        disabled={loading === idx}
                      >
                        {loading === idx ? (
                          <span className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Inscription...
                          </span>
                        ) : (
                          "S'inscrire"
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Bouton annuler */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2 border border-gray-300/50 rounded-xl text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md text-lg font-semibold"
              disabled={loading !== null}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEventRegistration;
