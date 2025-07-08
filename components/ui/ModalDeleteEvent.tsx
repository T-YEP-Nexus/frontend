import React from "react";

interface ModalDeleteEventProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  event: { title: string; start?: Date | string; end?: Date | string } | null;
}

const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
};

const ModalDeleteEvent: React.FC<ModalDeleteEventProps> = ({ open, onClose, onDelete, event }) => {
  if (!open || !event) return null;
  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md sm:w-[600px] max-w-[98vw] shadow-lg relative overflow-x-hidden">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-red-600">Supprimer l'événement</h2>
        <div className="mb-4">
          <div className="font-semibold text-lg">{event.title}</div>
          <div className="text-base text-gray-500">Début : {formatDate(event.start)}</div>
          <div className="text-base text-gray-500">Fin : {formatDate(event.end)}</div>
        </div>
        <div className="flex gap-4 justify-end mt-6">
          <button
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow-sm transition-all duration-200 text-lg"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-5 py-2 rounded-xl bg-red-400 text-white font-semibold hover:bg-red-500 shadow-sm transition-all duration-200 text-lg"
            onClick={onDelete}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteEvent; 