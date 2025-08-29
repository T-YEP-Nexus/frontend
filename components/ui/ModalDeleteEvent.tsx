import React from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import { X, Trash2, AlertTriangle, Calendar, Clock } from "lucide-react";

interface ModalDeleteEventProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: { id: string | number; title: string; start?: Date | string; end?: Date | string } | null;
}

const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
};

const ModalDeleteEvent: React.FC<ModalDeleteEventProps> = ({ open, onClose, onConfirm, event }) => {
  const { deleteEvent, loading, error } = useCalendarData();

  if (!open || !event) return null;

  const handleDelete = async () => {
    if (event && event.id) {
      try {
        await deleteEvent(Number(event.id));
        onConfirm(); 
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6 text-white relative">
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 text-xl p-2 rounded-full transition-all duration-200" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Supprimer l'événement</h2>
              <p className="text-red-100 text-sm mt-1">
                Cette action est irréversible
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Avertissement */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">Attention</h3>
            </div>
            <p className="text-red-700 leading-relaxed">
              Vous êtes sur le point de supprimer définitivement cet événement. 
              Cette action ne peut pas être annulée et supprimera également tous les créneaux associés.
            </p>
          </div>

          {/* Détails de l'événement */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Détails de l'événement</h3>
            </div>
            
            <div className="space-y-3">
              <div className="text-xl font-bold text-gray-900">{event.title}</div>
              
              {event.start && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Début : {formatDate(event.start)}</span>
                </div>
              )}
              
              {event.end && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Fin : {formatDate(event.end)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-xl">⚠</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec boutons d'action */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            className="px-6 py-3 rounded-xl bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Suppression...
              </span>
            ) : (
              "Supprimer définitivement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteEvent; 