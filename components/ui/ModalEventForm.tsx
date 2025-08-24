"use client";
import React, { useState, useEffect } from "react";
import PromotionDropdown from "./promotion-dropdown";
import EventTypeDropdown from "./event-type-dropdown";
import ModalDeleteEvent from "./ModalDeleteEvent";
import usePromotionsData from "@/hooks/usePromotionsData";
import { useCalendarData } from "@/hooks/useCalendarData";
import { getUserIdFromToken } from "@/lib/auth";

interface ModalEventFormProps {
  open: boolean;
  onClose: () => void;
  // La soumission est maintenant gérée en interne
  defaultStart?: string;
  defaultEnd?: string;
  eventToEdit?: any | null;
  createEvent: (data: any) => Promise<any>;
  updateEvent: (id: number, data: any) => Promise<any>;
  deleteEvent: (id: number) => Promise<void>;
}

const ModalEventForm: React.FC<ModalEventFormProps> = ({
  open,
  onClose,
  defaultStart,
  defaultEnd,
  eventToEdit,
  createEvent,
  updateEvent,
  deleteEvent,
}) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [promotion, setPromotion] = useState("");
  const [targetPromotion, setTargetPromotion] = useState(false);
  const [slotsPreview, setSlotsPreview] = useState<
    { start: string; end: string }[]
  >([]);
  const [eventType, setEventType] = useState<string>("other");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [slotDurationError, setSlotDurationError] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (eventToEdit && eventToEdit.event_datetime) {
        // Convert the UTC date from the backend to a local date for the input
        const utcDate = new Date(eventToEdit.event_datetime);

        // Format the local date into a string that datetime-local input accepts (YYYY-MM-DDTHH:MM)
        const localDateString = new Date(
          utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        setTitle(eventToEdit.title || "");
        setStart(localDateString);

        if (eventToEdit.duration_minutes) {
          const endDate = new Date(
            utcDate.getTime() + eventToEdit.duration_minutes * 60000
          );
          const localEndDateString = new Date(
            endDate.getTime() - endDate.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);
          setEnd(localEndDateString);
        } else {
          setEnd("");
        }

        setDescription(eventToEdit.description || "");
        setEventType(eventToEdit.event_type || "other");
        setPromotion(eventToEdit.id_prom || null);
        setTargetPromotion(!!eventToEdit.id_prom);
        setSelectedPromotionId(eventToEdit.id_prom || null);
      } else {
        // Reset form for new event
        setTitle("");
        setStart(defaultStart || "");
        setEnd(defaultEnd || "");
        setSlotDuration(30);
        setPromotion("");
        setTargetPromotion(false);
        setEventType("other");
        setDescription("");
        setSelectedPromotionId(null);
      }
    }
  }, [open, eventToEdit, defaultStart, defaultEnd]);

  useEffect(() => {
    // Générer dynamiquement les créneaux à chaque changement
    if (start && end && slotDuration > 0) {
      const slots: { start: string; end: string }[] = [];
      const startDate = new Date(start);
      const endDate = new Date(end);
      let current = new Date(startDate);
      while (current < endDate) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + slotDuration * 60000);
        if (slotEnd > endDate) break;
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
        current = slotEnd;
      }
      setSlotsPreview(slots);
    } else {
      setSlotsPreview([]);
    }
  }, [start, end, slotDuration]);

  useEffect(() => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) {
        setSlotDurationError(
          "La date de fin doit être après la date de début."
        );
      } else {
        const totalDuration = (endDate.getTime() - startDate.getTime()) / 60000; // en minutes
        if (slotDuration > totalDuration) {
          setSlotDurationError(
            "La durée d'un créneau ne peut pas dépasser la durée totale de l'événement."
          );
        } else {
          setSlotDurationError(null);
        }
      }
    } else {
      setSlotDurationError(null);
    }
  }, [start, end, slotDuration]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (slotDurationError) {
      setFormError(
        "Veuillez corriger les erreurs indiquées avant de soumettre."
      );
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId && !eventToEdit) {
      alert("Vous n'êtes pas authentifié.");
      return;
    }

    if (!start) {
      setFormError("La date de début est obligatoire.");
      return;
    }

    // Convert start date to the specific format expected by the backend
    const isoDateString = new Date(start).toISOString();
    const formattedStartDate =
      isoDateString.replace("T", " ").substring(0, 19) + "+00";

    if (title && start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const duration_minutes =
        (endDate.getTime() - startDate.getTime()) / 60000;

      const eventData = {
        title,
        event_datetime: formattedStartDate,
        duration_minutes,
        description,
        event_type: eventType as
          | "follow-up"
          | "kick-off"
          | "keynote"
          | "hub-talk"
          | "other",
        id_prom: targetPromotion ? selectedPromotionId : null,
      };

      try {
        setLoading(true);
        setFormError(null);

        if (eventToEdit) {
          await updateEvent(eventToEdit.id, eventData);
        } else {
          const userId = getUserIdFromToken();
          if (!userId) {
            throw new Error(
              "Impossible de récupérer l'ID de l'utilisateur. Veuillez vous reconnecter."
            );
          }
          await createEvent({ ...eventData, id_creator: userId!, report: "" });
        }
        onClose();
      } catch (error: any) {
        setFormError(error.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToEdit) return;

    try {
      setLoading(true);
      setFormError(null);
      await deleteEvent(eventToEdit.id);
      setShowDeleteModal(false);
      onClose();
    } catch (error: any) {
      setFormError(
        error.message || "Une erreur est survenue lors de la suppression."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300">
        {/* Header moderne avec gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white rounded-t-2xl">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {eventToEdit ? "Modifier" : "Créer"} un événement
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {eventToEdit
                    ? "Modifiez les détails de votre événement"
                    : "Planifiez un nouvel événement"}
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Première ligne : Titre et Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Réunion de projet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Type d'événement *
                </label>
                <EventTypeDropdown
                  selectedEventType={eventType}
                  onEventTypeChange={setEventType}
                  placeholder="Sélectionner un type d'événement"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description détaillée de l'événement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Promotion ciblée */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={targetPromotion}
                  onChange={(e) => setTargetPromotion(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                Cibler une promotion spécifique
              </label>
              {targetPromotion && (
                <div className="mt-2">
                  <PromotionDropdown
                    promotions={promotions}
                    selectedPromotion={selectedPromotionId}
                    onPromotionChange={setSelectedPromotionId}
                    loading={promotionsLoading}
                    error={promotionsError || undefined}
                    placeholder="Sélectionner une promotion"
                    required
                  />
                </div>
              )}
            </div>

            {/* Dates et heures */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date et heure de début *
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date et heure de fin *
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Durée d'un créneau (minutes) *
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  step={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  required
                />
                {slotDurationError && (
                  <p className="text-red-500 text-xs mt-1">
                    {slotDurationError}
                  </p>
                )}
              </div>
            </div>
            {/* Aperçu des créneaux générés */}
            {slotsPreview.length > 0 && !slotDurationError && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-blue-900 text-sm">
                    Créneaux générés ({slotsPreview.length})
                  </h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {slotsPreview.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white rounded-md px-2 py-1 border border-blue-100"
                    >
                      <span className="text-xs font-medium text-gray-700">
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
                      <span className="text-xs text-green-600 bg-green-50 px-1 py-0.5 rounded-full font-medium">
                        Libre
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {formError && (
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
                  <p className="text-red-700 font-medium">{formError}</p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                {eventToEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  {loading ? (
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
                      {eventToEdit ? "Mise à jour..." : "Création..."}
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {eventToEdit ? "Mettre à jour" : "Créer l'événement"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modale de suppression moderne */}
      <ModalDeleteEvent
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        event={eventToEdit}
      />
    </div>
  );
};

export default ModalEventForm;
