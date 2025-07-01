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
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-red-600">Supprimer l'événement</h2>
        <div className="mb-4">
          <div className="font-semibold">{event.title}</div>
          <div className="text-sm text-gray-500">Début : {formatDate(event.start)}</div>
          <div className="text-sm text-gray-500">Fin : {formatDate(event.end)}</div>
        </div>
        <div className="flex gap-4 justify-end mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
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