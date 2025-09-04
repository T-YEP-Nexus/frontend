"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import MultiPromotionSelector from "./MultiPromotionSelector";
import EventTypeSelector from "./EventTypeSelector";
import SlotManager from "./SlotManager";
import ModalDeleteEvent from "./ModalDeleteEvent";
import usePromotionsData from "@/hooks/usePromotionsData";
import { getUserIdFromToken } from "@/lib/auth";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Settings,
  Save,
  Trash2,
} from "lucide-react";

interface ModalEventFormProps {
  open: boolean;
  onClose: () => void;
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
  const [targetPromotion, setTargetPromotion] = useState(false);
  const [slots, setSlots] = useState<
    {
      id: string;
      start: string;
      end: string;
      user: string | null;
      maxUsers?: number;
      currentUsers?: number;
    }[]
  >([]);
  const [eventType, setEventType] = useState("other");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [slotDurationError, setSlotDurationError] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<string[]>(
    []
  );
  const [allowMultipleUsers, setAllowMultipleUsers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (eventToEdit) {
        if (eventToEdit.start) {
          const startDate = new Date(eventToEdit.start);
          const localStartString = new Date(
            startDate.getTime() - startDate.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);
          setStart(localStartString);
        } else {
          setStart(defaultStart || "");
        }

        if (eventToEdit.end) {
          const endDate = new Date(eventToEdit.end);
          const localEndString = new Date(
            endDate.getTime() - endDate.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);
          setEnd(localEndString);
        } else {
          setEnd(defaultEnd || "");
        }

        setTitle(eventToEdit.title || "");
        setDescription(eventToEdit.description || "");
        setEventType(eventToEdit.event_type || "other");
        setLocation(eventToEdit.location || "");

        const hasTargetPromotions =
          eventToEdit.target_promotions &&
          Array.isArray(eventToEdit.target_promotions) &&
          eventToEdit.target_promotions.length > 0;
        setTargetPromotion(hasTargetPromotions);
        setSelectedPromotionIds(
          hasTargetPromotions ? eventToEdit.target_promotions : []
        );

        const eventSlots = eventToEdit.slots;
        setSlots(eventSlots && Array.isArray(eventSlots) ? eventSlots : []);

        const eventSlotDuration = eventToEdit.slot_duration;
        setSlotDuration(eventSlotDuration > 0 ? eventSlotDuration : 30);

        setAllowMultipleUsers(!!eventToEdit.allow_multiple_users);
      } else {
        setTitle("");
        setStart(defaultStart || "");
        setEnd(defaultEnd || "");
        setSlotDuration(30);
        setTargetPromotion(false);
        setEventType("other");
        setDescription("");
        setLocation("");
        setSelectedPromotionIds([]);
        setSlots([]);
        setAllowMultipleUsers(false);
      }
    }
  }, [open, eventToEdit, defaultStart, defaultEnd]);

  useEffect(() => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) {
        setSlotDurationError(
          "La date de fin doit être après la date de début."
        );
      } else {
        const totalDuration = (endDate.getTime() - startDate.getTime()) / 60000;
        if (slotDuration > totalDuration) {
          setSlotDurationError(
            "La durée d'un créneau ne peut pas dépasser la durée totale."
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
    if (!title.trim() || !start || !end) {
      setFormError(
        "Le titre, la date de début et la date de fin sont obligatoires."
      );
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      setFormError("La date de fin doit être après la date de début.");
      return;
    }

    const duration_minutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / 60000
    );

    const eventData = {
      title: title.trim(),
      event_datetime: startDate.toISOString(),
      duration_minutes,
      description: description.trim(),
      location: location.trim(),
      event_type: eventType as
        | "follow-up"
        | "kick-off"
        | "keynote"
        | "hub-talk"
        | "other",
      target_promotions:
        targetPromotion && selectedPromotionIds.length > 0
          ? selectedPromotionIds
          : null,
      slot_duration: slotDuration,
      slots: slots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        user: slot.user,
        maxUsers: allowMultipleUsers ? slot.maxUsers || 5 : 1,
        currentUsers: slot.currentUsers || 0,
      })),
      allow_multiple_users: allowMultipleUsers,
    };

    try {
      setLoading(true);
      setFormError(null);
      if (eventToEdit) {
        await updateEvent(eventToEdit.id, eventData);
      } else {
        const userId = getUserIdFromToken();
        if (!userId)
          throw new Error("ID utilisateur introuvable. Reconnectez-vous.");
        await createEvent({ ...eventData, id_creator: userId, report: "" });
      }
      onClose();
    } catch (error: any) {
      setFormError(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
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
      setFormError(error.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (!open) return null;

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] shadow-2xl relative overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] px-8 py-6 text-white relative flex-shrink-0">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 text-xl p-2 rounded-full transition-all duration-200"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {eventToEdit
                    ? "Modifier l'événement"
                    : "Créer un nouvel événement"}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {eventToEdit
                    ? "Modifiez les détails de votre événement"
                    : "Remplissez les informations pour créer votre événement"}
                </p>
              </div>
            </div>
          </div>

          {/* Body - Scrollable content */}
          <div className="overflow-y-auto flex-grow">
            <form
              id="event-form"
              onSubmit={handleSubmit}
              className="p-8 space-y-8"
            >
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Informations de base
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Réunion d'équipe..."
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Décrivez votre événement..."
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Lieu
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Salle 101, Visioconférence..."
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Type d'événement
                  </h3>
                </div>
                <EventTypeSelector
                  value={eventType}
                  onChange={setEventType}
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Public cible
                  </h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-green-300 transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={targetPromotion}
                      onChange={(e) => setTargetPromotion(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium">Cibler des promotions</div>
                      <div className="text-sm text-gray-500">
                        Limiter l'accès à certaines promotions
                      </div>
                    </div>
                  </label>
                  {targetPromotion && (
                    <MultiPromotionSelector
                      promotions={promotions}
                      selectedPromotions={selectedPromotionIds}
                      onPromotionsChange={setSelectedPromotionIds}
                      loading={promotionsLoading}
                      error={promotionsError || undefined}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Horaires
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Début *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fin *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Settings className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configuration des créneaux
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée d'un créneau (minutes) *
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      step={5}
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      required
                    />
                    {slotDurationError && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠ {slotDurationError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors duration-200 w-full">
                      <input
                        type="checkbox"
                        checked={allowMultipleUsers}
                        onChange={(e) =>
                          setAllowMultipleUsers(e.target.checked)
                        }
                        className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium">Créneaux partagés</div>
                        <div className="text-sm text-gray-500">
                          Permettre plusieurs utilisateurs par créneau
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <SlotManager
                  slots={slots}
                  onSlotsChange={setSlots}
                  eventStart={start}
                  eventEnd={end}
                  slotDuration={slotDuration}
                  allowMultipleUsers={allowMultipleUsers}
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">⚠ {formError}</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
            <div>
              {eventToEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="event-form"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0E58D8] to-[#2A6BFF] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all disabled:opacity-50 disabled:transform-none"
              >
                <Save className="w-4 h-4" />
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {eventToEdit ? "Mise à jour..." : "Création..."}
                  </>
                ) : (
                  <span>
                    {eventToEdit ? "Mettre à jour" : "Créer l'événement"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalDeleteEvent
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        event={eventToEdit}
        loading={loading}
      />
    </>,
    document.body
  );
};

export default ModalEventForm;
