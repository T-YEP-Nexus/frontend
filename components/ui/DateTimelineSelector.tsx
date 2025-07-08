"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CalendarDays,
  Target,
  Presentation,
  Users,
} from "lucide-react";

interface DateTimelineSelectorProps {
  startDate: string;
  endDate: string;
  kickOffDate: string;
  followUpDate: string;
  keynoteDate: string;
  onDateChange: (field: string, value: string) => void;
}

const DateTimelineSelector: React.FC<DateTimelineSelectorProps> = ({
  startDate,
  endDate,
  kickOffDate,
  followUpDate,
  keynoteDate,
  onDateChange,
}) => {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  const phases = [
    {
      id: "startDate",
      label: "Début du projet",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      description: "Date de lancement officiel",
    },
    {
      id: "kickOffDate",
      label: "Kick-off",
      icon: Users,
      color: "from-green-500 to-green-600",
      description: "Présentation de l'équipe",
    },
    {
      id: "followUpDate",
      label: "Follow-up",
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      description: "Point d'étape intermédiaire",
    },
    {
      id: "keynoteDate",
      label: "Keynote",
      icon: Presentation,
      color: "from-purple-500 to-purple-600",
      description: "Présentation finale",
    },
    {
      id: "endDate",
      label: "Fin du projet",
      icon: Target,
      color: "from-red-500 to-red-600",
      description: "Date de clôture",
    },
  ];

  const getPhaseValue = (phaseId: string) => {
    switch (phaseId) {
      case "startDate":
        return startDate;
      case "endDate":
        return endDate;
      case "kickOffDate":
        return kickOffDate;
      case "followUpDate":
        return followUpDate;
      case "keynoteDate":
        return keynoteDate;
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Timeline visuelle */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-green-200 via-yellow-200 via-purple-200 to-red-200 rounded-full"></div>

        <div className="space-y-8">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = activePhase === phase.id;
            const hasValue = getPhaseValue(phase.id);

            return (
              <div
                key={phase.id}
                className="relative flex items-start gap-6 group"
              >
                {/* Point de la timeline */}
                <div
                  className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${
                    hasValue
                      ? `bg-gradient-to-br ${phase.color} text-white`
                      : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  } ${isActive ? "scale-110 ring-4 ring-blue-200" : ""}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Contenu de la phase */}
                <div
                  className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-blue-300 bg-blue-50 shadow-lg"
                      : hasValue
                      ? "border-gray-200 bg-white shadow-md hover:shadow-lg"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setActivePhase(phase.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4
                        className={`font-semibold text-lg transition-colors duration-300 ${
                          hasValue ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {phase.label}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {phase.description}
                      </p>
                    </div>

                    {hasValue && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(getPhaseValue(phase.id))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(getPhaseValue(phase.id)).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sélecteur de date */}
                  {isActive && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        Sélectionner la date
                      </label>
                      <input
                        type="date"
                        value={getPhaseValue(phase.id)}
                        onChange={(e) => onDateChange(phase.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                        min={phase.id === "endDate" ? startDate : undefined}
                        max={phase.id === "startDate" ? endDate : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateTimelineSelector;
