"use client";

import React, { useState } from "react";
import { Calendar, Clock, User, Plus, X, Check } from "lucide-react";

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  maxBookings?: number;
  currentBookings?: number;
}

interface AvailabilityManagerProps {
  availabilities: Availability[];
  onAvailabilitiesChange: (availabilities: Availability[]) => void;
  userId: string;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  availabilities,
  onAvailabilitiesChange,
  userId,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day: "monday",
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: true,
    maxBookings: 1,
  });

  const daysOfWeek = [
    { value: "monday", label: "Lundi" },
    { value: "tuesday", label: "Mardi" },
    { value: "wednesday", label: "Mercredi" },
    { value: "thursday", label: "Jeudi" },
    { value: "friday", label: "Vendredi" },
    { value: "saturday", label: "Samedi" },
    { value: "sunday", label: "Dimanche" },
  ];

  const addAvailability = () => {
    if (!newAvailability.startTime || !newAvailability.endTime) return;
    
    if (newAvailability.startTime >= newAvailability.endTime) {
      alert("L'heure de fin doit être après l'heure de début");
      return;
    }

    const availability: Availability = {
      id: `avail-${Date.now()}`,
      day: newAvailability.day,
      startTime: newAvailability.startTime,
      endTime: newAvailability.endTime,
      isRecurring: newAvailability.isRecurring,
      maxBookings: newAvailability.maxBookings,
      currentBookings: 0,
    };

    onAvailabilitiesChange([...availabilities, availability]);
    
    // Reset form
    setNewAvailability({
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: true,
      maxBookings: 1,
    });
    setShowAddForm(false);
  };

  const removeAvailability = (id: string) => {
    onAvailabilitiesChange(availabilities.filter(avail => avail.id !== id));
  };

  const updateAvailability = (id: string, updates: Partial<Availability>) => {
    onAvailabilitiesChange(availabilities.map(avail => 
      avail.id === id ? { ...avail, ...updates } : avail
    ));
  };

  const getDayLabel = (dayValue: string) => {
    return daysOfWeek.find(day => day.value === dayValue)?.label || dayValue;
  };

  const getAvailabilityStatus = (availability: Availability) => {
    if (availability.currentBookings === 0) {
      return { text: "Libre", color: "bg-green-100 text-green-800" };
    } else if (availability.currentBookings >= (availability.maxBookings || 1)) {
      return { text: "Complet", color: "bg-red-100 text-red-800" };
    } else {
      return { text: `${availability.currentBookings}/${availability.maxBookings} places`, color: "bg-yellow-100 text-yellow-800" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Mes disponibilités
        </h3>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Ajouter une disponibilité</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
              <select
                value={newAvailability.day}
                onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <input
                type="time"
                value={newAvailability.startTime}
                onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="time"
                value={newAvailability.endTime}
                onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Places max</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newAvailability.maxBookings}
                onChange={(e) => setNewAvailability({ ...newAvailability, maxBookings: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={newAvailability.isRecurring}
              onChange={(e) => setNewAvailability({ ...newAvailability, isRecurring: e.target.checked })}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Récurrent (chaque semaine)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addAvailability}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des disponibilités */}
      <div className="space-y-2">
        {availabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune disponibilité configurée</p>
            <p className="text-sm">Ajoutez vos créneaux disponibles pour que les autres puissent vous contacter</p>
          </div>
        ) : (
          availabilities.map((availability) => {
            const status = getAvailabilityStatus(availability);
            return (
              <div
                key={availability.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {getDayLabel(availability.day)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {availability.startTime} - {availability.endTime}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                  {availability.isRecurring && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Récurrent
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={availability.maxBookings || 1}
                      onChange={(e) => updateAvailability(availability.id, { maxBookings: Number(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeAvailability(availability.id)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;
