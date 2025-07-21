"use client";
import React, { useState, useEffect } from "react";
import PromotionDropdown from "./promotion-dropdown";
import usePromotionsData from "@/hooks/usePromotionsData";

interface ModalEventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; start: string; end: string; slotDuration: number; promotion: string }) => void;
  defaultStart?: string;
  defaultEnd?: string;
}

const ModalEventForm: React.FC<ModalEventFormProps> = ({ open, onClose, onSubmit, defaultStart, defaultEnd }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(defaultStart || "");
  const [end, setEnd] = useState(defaultEnd || "");
  const [slotDuration, setSlotDuration] = useState(30);
  const [promotion, setPromotion] = useState("");
  const [targetPromotion, setTargetPromotion] = useState(false);
  const [slotsPreview, setSlotsPreview] = useState<{start: string, end: string}[]>([]);

  const { promotions, loading: promotionsLoading, error: promotionsError } = usePromotionsData();

  useEffect(() => {
    if (open) {
      setTitle("");
      setStart(defaultStart || "");
      setEnd(defaultEnd || "");
      setSlotDuration(30);
      setPromotion("");
      setTargetPromotion(false);
    }
  }, [open, defaultStart, defaultEnd]);

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

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md sm:w-[900px] max-w-[98vw] shadow-lg relative overflow-x-hidden">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">Créer un événement</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (title && start && end && slotDuration > 0 && (!targetPromotion || (targetPromotion && promotion))) {
              onSubmit({ title, start, end, slotDuration, promotion: targetPromotion ? promotion : "" });
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Titre de l'événement"
            className="border border-blue-300 bg-blue-50 rounded-xl px-3 py-2 text-lg focus:outline-none focus:border-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
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
              promotions={promotions.map(p => ({ ...p, id: Number(p.id) }))}
              selectedPromotion={promotion}
              onPromotionChange={setPromotion}
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
          </div>
          {/* Aperçu des créneaux générés */}
          {slotsPreview.length > 0 && (
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
          <button type="submit" className="bg-blue-400 text-white rounded-xl px-5 py-2 font-semibold shadow-sm hover:bg-blue-500 hover:shadow-lg transition-all duration-200 text-lg">Créer</button>
        </form>
      </div>
    </div>
  );
};

export default ModalEventForm; 