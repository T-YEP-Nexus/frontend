"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Tag,
  Trash2,
} from "lucide-react";

interface EventDetails {
  id: string;
  title: string;
  start?: Date | string;
  end?: Date | string;
  event_type?: string;
  description?: string;
  location?: string;
  target_promotions?: string[];
  slots?: any[];
  report?: string;
  id_creator?: string;
  created_at?: string;
  updated_at?: string;
}

interface ModalEventDetailsProps {
  open: boolean;
  onClose: () => void;
  event: EventDetails | null;
  userRole?: "admin" | "advisor" | "student";
  onEdit?: (event: EventDetails) => void;
  onDelete?: (eventId: string) => void;
}

const ModalEventDetails: React.FC<ModalEventDetailsProps> = ({
  open,
  onClose,
  event,
  userRole,
  onEdit,
  onDelete,
}) => {
  if (!open || !event || typeof event !== "object") {
    console.log("ModalEventDetails: Données invalides", { open, event });
    return null;
  }

  const formatDate = (date: Date | string) => {
    if (!date) return "Date non définie";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Date invalide";
      return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return "Date invalide";
    }
  };

  const formatTime = (date: Date | string) => {
    if (!date) return "Heure non définie";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Heure invalide";
      return d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erreur formatage heure:", error);
      return "Heure invalide";
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "bg-green-100 text-green-800 border-green-200";
      case "kick-off":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "keynote":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "hub-talk":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "projet":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "examen":
        return "bg-red-100 text-red-800 border-red-200";
      case "stage":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hackathon":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "reunion":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "Follow-up";
      case "kick-off":
        return "Kick-off";
      case "keynote":
        return "Keynote";
      case "hub-talk":
        return "Hub Talk";
      case "cours":
        return "Cours";
      case "projet":
        return "Projet";
      case "examen":
        return "Examen";
      case "stage":
        return "Stage";
      case "hackathon":
        return "Hackathon";
      case "reunion":
        return "Réunion";
      default:
        return eventType || "Autre";
    }
  };

  const isAdmin = userRole === "admin" || userRole === "advisor";

  const [promotionNames, setPromotionNames] = useState<string[]>([]);
  const [creatorName, setCreatorName] = useState<string>("");

  useEffect(() => {
    const fetchNames = async () => {
      if (event) {
        if (event.target_promotions && event.target_promotions.length > 0) {
          console.log(
            "Tentative de récupération des noms de promotions:",
            event.target_promotions
          );
          try {
            console.log("Appel API pour toutes les promotions");
            const response = await fetch(`http://localhost:3004/promotions`, {
              credentials: "include",
            });
            console.log("Réponse API promotions:", response.status);
            if (response.ok) {
              const data = await response.json();
              console.log("Données promotions:", data);
              if (data.success && data.data) {
                const promotionMap = new Map(
                  data.data.map((promo: any) => [promo.id, promo.name])
                );
                const names: string[] = event.target_promotions.map(
                  (promoId) => {
                    const value = promotionMap.get(promoId);
                    return typeof value === "string" ? value : String(promoId);
                  }
                );
                console.log("Noms des promotions récupérés:", names);
                setPromotionNames(names);
              }
            }
          } catch (error) {
            console.error("Erreur récupération promotions:", error);
          }
        }

        if (event.id_creator) {
          try {
            console.log(`Appel API pour créateur: ${event.id_creator}`);
            const response = await fetch(
              `http://localhost:3001/users/${event.id_creator}`,
              {
                credentials: "include",
              }
            );
            console.log(`Réponse API créateur:`, response.status);
            if (response.ok) {
              const data = await response.json();
              console.log(`Données créateur:`, data);
              if (data.data) {
                const creatorEmail = data.data.email;
                console.log(`Email du créateur:`, creatorEmail);
                setCreatorName(creatorEmail);
              }
            }
          } catch (error) {
            console.error("Erreur récupération créateur:", error);
          }
        }
      }
    };

    fetchNames();
  }, [event]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] px-8 py-6 text-white relative">
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 text-xl p-2 rounded-full transition-all duration-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <p className="text-blue-100 text-sm mt-1">
                Détails de l'événement
              </p>
            </div>
          </div>
        </div>

        {/* Body - Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] p-8">
          {/* Event Type Badge */}
          {event.event_type && (
            <div className="mb-8">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm ${getEventTypeColor(
                  event.event_type
                )}`}
              >
                <Tag size={16} className="mr-2" />
                {getEventTypeLabel(event.event_type)}
              </span>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date and Time */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Date et heure
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      {event.start && formatDate(event.start)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      De {event.start && formatTime(event.start)} à{" "}
                      {event.end && formatTime(event.end)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Description
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lieu
                    </h3>
                  </div>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              )}

              {/* Report */}
              {event.report && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rapport
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {event.report}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {/* Target Promotions */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Promotions ciblées
                  </h3>
                </div>
                {promotionNames.length > 0 ? (
                  <div className="space-y-2">
                    {promotionNames.map((name, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : event.target_promotions &&
                  event.target_promotions.length > 0 ? (
                  <div className="space-y-2">
                    {event.target_promotions.map((promo, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {promo}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-600 font-medium">
                    Toutes les promotions
                  </p>
                )}
              </div>

              {/* Slots Information */}
              {event.slots && event.slots.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-green-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Créneaux disponibles
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {event.slots.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          slot.user
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span>
                          {new Date(slot.start).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(slot.end).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs">
                          {slot.user ? "Réservé" : "Libre"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Informations
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {event.created_at && (
                    <p>
                      Créé le :{" "}
                      {new Date(event.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  {event.updated_at && (
                    <p>
                      Modifié le :{" "}
                      {new Date(event.updated_at).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  {event.id_creator && (
                    <p>Créateur : {creatorName || event.id_creator}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec boutons d'action */}
        {isAdmin && (
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalEventDetails;
