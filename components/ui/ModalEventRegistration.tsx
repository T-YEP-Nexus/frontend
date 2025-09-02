"use client";
import React, { useState, useEffect } from "react";
import {
  Loader2,
  X,
  Calendar,
  Clock,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react";
import { getUserIdFromToken } from "@/lib/auth";

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
    location?: string;
    slots?: Slot[];
    target_promotions?: string[];
    allow_multiple_users?: boolean;
    slot_duration?: number;
  } | null;
  isRegistered: boolean;
  onRegister: (eventId: number, slotIndex?: number) => Promise<void>;
  onRegisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
  onUnregister: (eventId: number) => Promise<void>;
  onUnregisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
}

const ModalEventRegistration: React.FC<ModalEventRegistrationProps> = ({
  open,
  onClose,
  event,
  isRegistered,
  onRegister,
  onRegisterSlot,
  onUnregister,
  onUnregisterSlot,
}) => {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSlotIndex, setUserSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    if (event && event.slots && Array.isArray(event.slots)) {
      const userId = getUserIdFromToken();
      if (userId) {
        const userSlotIdx = event.slots.findIndex(
          (slot) => slot.user === userId
        );
        setUserSlotIndex(userSlotIdx >= 0 ? userSlotIdx : null);
      }
    }
  }, [event]);

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
      await onRegisterSlot(Number(event.id), slotIdx);
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(null);
    }
  };

  const handleUnregisterSlot = async () => {
    if (!event || userSlotIndex === null) return;
    setLoading(userSlotIndex);
    setError(null);
    try {
      await onUnregisterSlot(Number(event.id), userSlotIndex);
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(null);
    }
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white relative flex-shrink-0">
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 text-xl p-2 rounded-full transition-all duration-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Inscription à l'événement</h2>
              <p className="text-blue-100 text-sm mt-1">
                Choisissez un créneau pour vous inscrire
              </p>
            </div>
          </div>
        </div>

        {/* Body - Scrollable content */}
        <div className="overflow-y-auto flex-grow p-8">
          <div className="space-y-6">
            {/* Informations de l'événement */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de l'événement
                </h3>
              </div>

              <div className="space-y-3">
                <div className="text-xl font-bold text-gray-900">
                  {event.title}
                </div>

                {event.start && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>{formatDate(event.start)}</span>
                  </div>
                )}

                {event.description && (
                  <div className="text-gray-600 leading-relaxed">
                    {event.description}
                  </div>
                )}
              </div>
            </div>

            {/* Liste des créneaux disponibles */}
            {Array.isArray(event.slots) && event.slots.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Créneaux disponibles
                  </h3>
                </div>

                {(userSlotIndex !== null ||
                  (isRegistered && userSlotIndex === null)) && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {userSlotIndex !== null
                          ? "Vous êtes déjà inscrit sur un créneau !"
                          : "Vous êtes assigné à cet événement !"}
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm mt-1">
                      {userSlotIndex !== null
                        ? "Vous pouvez vous désinscrire via le bouton sur votre créneau."
                        : "Vous pouvez choisir un créneau spécifique ci-dessous."}
                    </p>
                  </div>
                )}

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {event.slots.map((slot, idx) => {
                    const isMySlot = slot.user === getUserIdFromToken();
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                          isMySlot
                            ? "bg-blue-50 border-blue-300 shadow-md"
                            : slot.user
                            ? "bg-gray-100 border-gray-200 opacity-70"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isMySlot ? "bg-blue-100" : "bg-gray-100"
                            }`}
                          >
                            <Clock
                              className={`w-4 h-4 ${
                                isMySlot ? "text-blue-600" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(slot.start).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(slot.end).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {slot.user && (
                              <div
                                className={`text-sm flex items-center gap-1 ${
                                  isMySlot ? "text-blue-700" : "text-gray-500"
                                }`}
                              >
                                {isMySlot && (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                {isMySlot ? "Votre créneau" : "Réservé"}
                              </div>
                            )}
                          </div>
                        </div>

                        {isMySlot ? (
                          <button
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 disabled:opacity-50"
                            onClick={handleUnregisterSlot}
                            disabled={loading !== null}
                          >
                            {loading === idx ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Se désinscrire"
                            )}
                          </button>
                        ) : !slot.user ? (
                          <button
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 disabled:opacity-50"
                            onClick={() => handleRegisterSlot(idx)}
                            disabled={
                              loading !== null || userSlotIndex !== null
                            }
                          >
                            {loading === idx ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isRegistered && userSlotIndex === null ? (
                              "Réserver"
                            ) : (
                              "S'inscrire"
                            )}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-medium">⚠ {error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            disabled={loading !== null}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEventRegistration;
