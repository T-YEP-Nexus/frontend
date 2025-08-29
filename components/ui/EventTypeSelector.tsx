"use client";

import React from "react";
import { 
  Users, 
  Target, 
  Presentation, 
  Coffee, 
  MapPin
} from "lucide-react";

interface EventType {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const eventTypes: EventType[] = [
  {
    value: "follow-up",
    label: "Follow-up",
    icon: <Users className="w-5 h-5" />,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Suivi pédagogique individuel"
  },
  {
    value: "kick-off",
    label: "Kick-off",
    icon: <Target className="w-5 h-5" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Lancement de projet"
  },
  {
    value: "keynote",
    label: "Keynote",
    icon: <Presentation className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Conférence ou présentation"
  },
  {
    value: "hub-talk",
    label: "Hub Talk",
    icon: <Coffee className="w-5 h-5" />,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    description: "Discussion informelle"
  },
  {
    value: "other",
    label: "Autre",
    icon: <MapPin className="w-5 h-5" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "Autre type d'événement"
  }
];

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  value,
  onChange,
  required = false,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-base font-medium text-gray-700">
        Type d'événement {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {eventTypes.map((eventType) => (
          <button
            key={eventType.value}
            type="button"
            onClick={() => onChange(eventType.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              value === eventType.value
                ? `${eventType.color} border-current shadow-lg`
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                value === eventType.value
                  ? "bg-white/20"
                  : "bg-gray-100"
              }`}>
                {eventType.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">{eventType.label}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {eventType.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventTypeSelector;
