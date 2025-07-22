"use client";
import React, { useState, useEffect } from "react";
import PromotionDropdown from "./promotion-dropdown";
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
  deleteEvent 
}) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [promotion, setPromotion] = useState("");
  const [targetPromotion, setTargetPromotion] = useState(false);
  const [slotsPreview, setSlotsPreview] = useState<{start: string, end: string}[]>([]);
  const [eventType, setEventType] = useState('other');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [slotDurationError, setSlotDurationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);


  const { promotions, loading: promotionsLoading, error: promotionsError } = usePromotionsData();
  
  useEffect(() => {
    if (open) {
      setFormError(null);
      if (eventToEdit && eventToEdit.event_datetime) {
        // Convert the UTC date from the backend to a local date for the input
        const utcDate = new Date(eventToEdit.event_datetime);
        
        // Format the local date into a string that datetime-local input accepts (YYYY-MM-DDTHH:MM)
        const localDateString = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setTitle(eventToEdit.title || "");
        setStart(localDateString);
        
        if (eventToEdit.duration_minutes) {
          const endDate = new Date(utcDate.getTime() + eventToEdit.duration_minutes * 60000);
          const localEndDateString = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          setEnd(localEndDateString);
        } else {
          setEnd("");
        }

        setDescription(eventToEdit.description || '');
        setEventType(eventToEdit.event_type || 'other');
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
        setEventType('other');
        setDescription('');
        setSelectedPromotionId(null);
      }
    }
  }, [open, eventToEdit, defaultStart, defaultEnd]);

  useEffect(() => {
    // Générer dynamiquement les créneaux à chaque changement
    if (start && end && slotDuration > 0) {
      const slots: {start: string, end: string}[] = [];
      const startDate = new Date(start);
      const endDate = new Date(end);
      let current = new Date(startDate);
      while (current < endDate) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + slotDuration * 60000);
        if (slotEnd > endDate) break;
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
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
        setSlotDurationError("La date de fin doit être après la date de début.");
      } else {
        const totalDuration = (endDate.getTime() - startDate.getTime()) / 60000; // en minutes
        if (slotDuration > totalDuration) {
          setSlotDurationError("La durée d'un créneau ne peut pas dépasser la durée totale de l'événement.");
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
      setFormError("Veuillez corriger les erreurs indiquées avant de soumettre.");
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
    const formattedStartDate = isoDateString.replace('T', ' ').substring(0, 19) + "+00";


    if (title && start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const duration_minutes = (endDate.getTime() - startDate.getTime()) / 60000;

      const eventData = {
        title,
        event_datetime: formattedStartDate,
        duration_minutes,
        description,
        event_type: eventType as 'follow-up' | 'kick-off' | 'keynote' | 'hub-talk' | 'other',
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
            throw new Error("Impossible de récupérer l'ID de l'utilisateur. Veuillez vous reconnecter.");
          }
          await createEvent({ ...eventData, id_creator: userId!, report: '' });
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

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.")) {
      try {
        setLoading(true);
        setFormError(null);
        await deleteEvent(eventToEdit.id);
        onClose();
      } catch (error: any) {
        setFormError(error.message || "Une erreur est survenue lors de la suppression.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md sm:w-[900px] max-w-[98vw] shadow-lg relative overflow-x-hidden">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">{eventToEdit ? "Modifier" : "Créer"} un événement</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Titre de l'événement"
            className="border border-blue-300 bg-blue-50 rounded-xl px-3 py-2 text-lg focus:outline-none focus:border-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optionnel)"
            className="border border-blue-300 bg-blue-50 rounded-xl px-3 py-2 text-lg focus:outline-none focus:border-blue-500"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="border border-blue-300 bg-blue-50 rounded-xl px-3 py-2 text-lg focus:outline-none focus:border-blue-500"
            required
          >
            <option value="other">Autre</option>
            <option value="follow-up">Follow-up</option>
            <option value="kick-off">Kick-off</option>
            <option value="keynote">Keynote</option>
            <option value="hub-talk">Hub-talk</option>
          </select>
          <label className="flex items-center gap-2 text-base font-medium">
            <input
              type="checkbox"
              checked={targetPromotion}
              onChange={e => setTargetPromotion(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            Cibler une promotion spécifique
          </label>
          {targetPromotion && (
            <PromotionDropdown
              promotions={promotions}
              selectedPromotion={selectedPromotionId}
              onPromotionChange={setSelectedPromotionId}
              loading={promotionsLoading}
              error={promotionsError || undefined}
              placeholder="Sélectionner une promotion"
              required
            />
          )}
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-base font-medium mb-1">Début</label>
              <input
                type="datetime-local"
                className="border border-blue-300 bg-blue-50 rounded-xl px-2 py-1 w-full max-w-full text-lg focus:outline-none focus:border-blue-500"
                value={start}
                onChange={e => setStart(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-base font-medium mb-1">Fin</label>
              <input
                type="datetime-local"
                className="border border-blue-300 bg-blue-50 rounded-xl px-2 py-1 w-full max-w-full text-lg focus:outline-none focus:border-blue-500"
                value={end}
                onChange={e => setEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-base font-medium mb-1 mt-2">Durée d'un créneau (min)</label>
            <input
              type="number"
              min={5}
              max={240}
              step={5}
              className="border border-blue-300 bg-blue-50 rounded-xl px-2 py-1 w-full max-w-full text-lg focus:outline-none focus:border-blue-500"
              value={slotDuration}
              onChange={e => setSlotDuration(Number(e.target.value))}
              required
            />
            {slotDurationError && <p className="text-red-500 text-sm mt-1">{slotDurationError}</p>}
          </div>
          {/* Aperçu des créneaux générés */}
          {slotsPreview.length > 0 && !slotDurationError && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="font-semibold text-blue-900 mb-2">Créneaux générés :</div>
              <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2">
                {slotsPreview.map((slot, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-blue-800 text-sm">
                    <span className="flex-1">{new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-xs text-gray-400">Libre</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
          <div className="flex justify-between items-center">
            <div>
              {eventToEdit && (
                <button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 ease-in-out disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
                >
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 ease-in-out">Annuler</button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 hover:-translate-y-0.5 transform transition-all duration-300 ease-in-out disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              >
                {loading ? (eventToEdit ? "Mise à jour..." : "Création...") : (eventToEdit ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEventForm; 