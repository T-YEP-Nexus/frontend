import React, { useState, useEffect } from "react";
import { getUserIdFromToken } from "@/lib/auth";

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
  } | null;
  isRegistered: boolean;
  onRegister: (eventId: number) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    if (!event) return;

    setLoading(true);
    setError(null);

    try {
      if (isRegistered) {
        await onUnregister(Number(event.id));
      } else {
        await onRegister(Number(event.id));
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (eventType?: string) => {
    switch (eventType) {
      case 'follow-up':
        return 'bg-green-100 text-green-800';
      case 'kick-off':
        return 'bg-orange-100 text-orange-800';
      case 'keynote':
        return 'bg-purple-100 text-purple-800';
      case 'hub-talk':
        return 'bg-cyan-100 text-cyan-800';
      case 'other':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isRegistered ? "Se désinscrire" : "S'inscrire"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Informations de l'événement */}
          <div className="border border-gray-200/50 rounded-xl p-4 bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            
            {event.event_type && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getEventTypeColor(event.event_type)}`}>
                {event.event_type}
              </span>
            )}

            {event.start && (
              <p className="text-sm text-gray-600 mb-2">
                📅 {formatDate(event.start)}
              </p>
            )}

            {event.description && (
              <p className="text-sm text-gray-700">
                {event.description}
              </p>
            )}
          </div>

          {/* Message de confirmation */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {isRegistered 
                ? "Êtes-vous sûr de vouloir vous désinscrire de cet événement ?"
                : "Voulez-vous vous inscrire à cet événement ?"
              }
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300/50 rounded-xl text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleAction}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-xl text-white transition-all duration-200 hover:shadow-lg ${
                isRegistered
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-400'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRegistered ? "Désinscription..." : "Inscription..."}
                </div>
              ) : (
                isRegistered ? "Se désinscrire" : "S'inscrire"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEventRegistration; 