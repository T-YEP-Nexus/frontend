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
    color?: string;
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
  const [loading, setLoading] = useState<number | null>(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300">
        {/* Header moderne avec couleur adaptée à l'événement */}
        <div
          className="p-6 text-white rounded-t-2xl"
          style={{
            background: event.color
              ? `linear-gradient(to right, ${event.color}, ${event.color}dd)`
              : "linear-gradient(to right, #10b981, #059669)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Inscription à l'événement
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Choisissez un créneau disponible
                </p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              onClick={onClose}
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
        </div>

        {/* Contenu de la modale */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Informations de l'événement */}
            <div
              className="border rounded-lg p-3"
              style={{
                background: event.color
                  ? `linear-gradient(to right, ${event.color}10, ${event.color}20)`
                  : "linear-gradient(to right, #10b98110, #10b98120)",
                borderColor: event.color ? `${event.color}40` : "#10b98140",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: event.color || "#10b981" }}
                ></div>
                <h3
                  className="font-semibold text-base"
                  style={{ color: event.color || "#10b981" }}
                >
                  {event.title}
                </h3>
              </div>
              {event.start && (
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: event.color || "#10b981" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className="text-xs font-medium"
                    style={{ color: event.color || "#10b981" }}
                  >
                    {formatDate(event.start)}
                  </span>
                </div>
              )}
              {event.description && (
                <div className="mt-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: event.color || "#10b981" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span
                        className="text-sm font-medium block mb-1"
                        style={{ color: event.color || "#10b981" }}
                      >
                        Description :
                      </span>
                      <p
                        className="text-sm bg-white/50 rounded-md p-3 border whitespace-pre-wrap leading-relaxed min-h-[60px]"
                        style={{
                          color: event.color || "#10b981",
                          borderColor: event.color
                            ? `${event.color}40`
                            : "#10b98140",
                        }}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Liste des créneaux disponibles */}
            {Array.isArray(event.slots) && event.slots.length > 0 && (
              <div
                className="border rounded-lg p-3"
                style={{
                  background: event.color
                    ? `linear-gradient(to right, ${event.color}08, ${event.color}15)`
                    : "linear-gradient(to right, #10b98108, #10b98115)",
                  borderColor: event.color ? `${event.color}30` : "#10b98130",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: event.color || "#10b981" }}
                  ></div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: event.color || "#10b981" }}
                  >
                    Créneaux disponibles (
                    {event.slots.filter((slot) => !slot.user).length})
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {event.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border shadow-sm"
                      style={{
                        borderColor: event.color
                          ? `${event.color}30`
                          : "#10b98130",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color || "#10b981" }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
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
                      </div>
                      {slot.user ? (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                          Occupé par {slot.user}
                        </span>
                      ) : (
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                          style={{
                            background: event.color
                              ? `linear-gradient(to right, ${event.color}, ${event.color}dd)`
                              : "linear-gradient(to right, #10b981, #059669)",
                          }}
                          onClick={() => handleRegisterSlot(idx)}
                          disabled={loading === idx}
                        >
                          {loading === idx ? (
                            <>
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Inscription...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              S'inscrire
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 font-medium cursor-pointer"
                disabled={loading !== null}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEventRegistration;
