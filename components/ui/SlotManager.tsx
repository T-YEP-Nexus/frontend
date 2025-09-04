"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Clock, User, Users } from "lucide-react";

interface Slot {
  id: string;
  start: string;
  end: string;
  user: string | null;
  maxUsers?: number;
  currentUsers?: number;
}

interface SlotManagerProps {
  slots: Slot[];
  onSlotsChange: (slots: Slot[]) => void;
  eventStart: string;
  eventEnd: string;
  slotDuration: number;
  allowMultipleUsers?: boolean;
  maxUsersPerSlot?: number;
}

const SlotManager: React.FC<SlotManagerProps> = ({
  slots,
  onSlotsChange,
  eventStart,
  eventEnd,
  slotDuration,
  allowMultipleUsers = false,
  maxUsersPerSlot = 1
}) => {
  const [customSlots, setCustomSlots] = useState<Slot[]>([]);
  const [showCustomSlotForm, setShowCustomSlotForm] = useState(false);
  const [customSlotStart, setCustomSlotStart] = useState("");
  const [customSlotEnd, setCustomSlotEnd] = useState("");
  const [customSlotMaxUsers, setCustomSlotMaxUsers] = useState(maxUsersPerSlot);

  useEffect(() => {
    if (eventStart && eventEnd && slotDuration > 0) {
      try {
        const generatedSlots: Slot[] = [];
        const startDate = new Date(eventStart);
        const endDate = new Date(eventEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('Dates invalides pour la génération de slots:', { eventStart, eventEnd });
          return;
        }
        
        let current = new Date(startDate);
        let slotId = 0;

        while (current < endDate) {
          const slotStart = new Date(current);
          const slotEnd = new Date(current.getTime() + slotDuration * 60000);
          
          if (slotEnd > endDate) break;
          
          generatedSlots.push({
            id: `auto-${slotId++}`,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            user: null,
            maxUsers: maxUsersPerSlot,
            currentUsers: 0
          });
          
          current = slotEnd;
        }
        
        const validSlots = generatedSlots.filter(slot => slot && slot.id);
        console.log('Slots générés:', validSlots);
        onSlotsChange(validSlots);
      } catch (error) {
        console.error('Erreur lors de la génération des slots:', error);
        onSlotsChange([]);
      }
    }
  }, [eventStart, eventEnd, slotDuration, maxUsersPerSlot]);

  const addCustomSlot = () => {
    if (!customSlotStart || !customSlotEnd || !eventStart) return;
    
    try {
      const eventDate = new Date(eventStart);
      if (isNaN(eventDate.getTime())) {
        console.error('Date de début d\'événement invalide:', eventStart);
        return;
      }
      
      const [startHour, startMinute] = customSlotStart.split(':').map(Number);
      const [endHour, endMinute] = customSlotEnd.split(':').map(Number);
      
      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        console.error('Format d\'heure invalide:', { customSlotStart, customSlotEnd });
        return;
      }
      
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(endHour, endMinute, 0, 0);
      
      if (startDate >= endDate) {
        alert("L'heure de fin doit être après l'heure de début");
        return;
      }
      
      const newSlot: Slot = {
        id: `custom-${Date.now()}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        user: null,
        maxUsers: customSlotMaxUsers,
        currentUsers: 0
      };
      
      const updatedSlots = [...slots, newSlot];
      onSlotsChange(updatedSlots);
      
      setCustomSlotStart("");
      setCustomSlotEnd("");
      setCustomSlotMaxUsers(maxUsersPerSlot);
      setShowCustomSlotForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du créneau personnalisé:', error);
      alert('Erreur lors de l\'ajout du créneau. Vérifiez les heures saisies.');
    }
  };

  const removeSlot = (slotId: string) => {
    if (!slotId) {
      console.warn('Tentative de suppression d\'un slot sans ID');
      return;
    }
    const updatedSlots = slots.filter(slot => slot.id !== slotId);
    onSlotsChange(updatedSlots);
  };

  const updateSlotMaxUsers = (slotId: string, maxUsers: number) => {
    if (!slotId) {
      console.warn('Tentative de mise à jour d\'un slot sans ID');
      return;
    }
    const updatedSlots = slots.map(slot => 
      slot.id === slotId ? { ...slot, maxUsers } : slot
    );
    onSlotsChange(updatedSlots);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSlotStatus = (slot: Slot) => {
    const currentUsers = slot.currentUsers || 0;
    if (currentUsers === 0) {
      return { text: "Libre", color: "bg-green-100 text-green-800" };
    } else if (currentUsers >= (slot.maxUsers || 1)) {
      return { text: "Complet", color: "bg-red-100 text-red-800" };
    } else {
      return { text: `${currentUsers}/${slot.maxUsers} places`, color: "bg-yellow-100 text-yellow-800" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Gestion des créneaux
        </h3>
      </div>


      {/* Liste des créneaux */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {slots.map((slot, index) => {
          const status = getSlotStatus(slot);
          if (!slot || !slot.id) {
            console.warn('Slot invalide détecté:', slot);
            return null;
          }
          
          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                slot.id.startsWith('custom') 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="font-medium">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
                {slot.id && slot.id.startsWith('custom') && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Personnalisé
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {allowMultipleUsers && (
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={slot.maxUsers || 1}
                      onChange={(e) => updateSlotMaxUsers(slot.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
                
                {slot.id && slot.id.startsWith('custom') && (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Aucun créneau configuré</p>
        </div>
      )}
    </div>
  );
};

export default SlotManager;
