"use client";

import React from "react";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";

interface CalendarStatsProps {
  totalEvents: number;
  eventsByType: Record<string, number>;
  upcomingEvents: number;
  myEvents: number;
  totalSlots: number;
  availableSlots: number;
  userRole?: "admin" | "advisor" | "student";
}

const CalendarStats: React.FC<CalendarStatsProps> = ({
  totalEvents,
  eventsByType,
  upcomingEvents,
  myEvents,
  totalSlots,
  availableSlots,
  userRole = "student",
}) => {
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "bg-green-100 text-green-800";
      case "kick-off":
        return "bg-orange-100 text-orange-800";
      case "keynote":
        return "bg-purple-100 text-purple-800";
      case "hub-talk":
        return "bg-cyan-100 text-cyan-800";
      case "cours":
        return "bg-blue-100 text-blue-800";
      case "projet":
        return "bg-indigo-100 text-indigo-800";
      case "examen":
        return "bg-red-100 text-red-800";
      case "stage":
        return "bg-yellow-100 text-yellow-800";
      case "hackathon":
        return "bg-pink-100 text-pink-800";
      case "reunion":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "Follow-up";
      case "kick-off":
        return "Kick-off";
      case "keynote":
        return "Keynote";
      case "hub-talk":
        return "Hub Talk";
      case "cours":
        return "Cours";
      case "projet":
        return "Projet";
      case "examen":
        return "Examen";
      case "stage":
        return "Stage";
      case "hackathon":
        return "Hackathon";
      case "reunion":
        return "Réunion";
      default:
        return eventType;
    }
  };

  const topEventTypes = Object.entries(eventsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const isStudent = userRole === "student";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 transition-all duration-300 hover:shadow-md min-h-[155px] h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Statistiques
      </h3>

      <div
        className={`grid gap-3 ${
          isStudent
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-4"
        } items-stretch auto-rows-fr flex-1`}
      >
        {/* Total des événements */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200 transition-all duration-300 hover:shadow-sm hover:scale-102 h-full">
          <div className="flex items-center justify-center flex-col h-full">
            <p className="text-xs font-medium text-blue-600 mb-1">Total</p>
            <p className="text-lg font-bold text-blue-900">{totalEvents}</p>
          </div>
        </div>

        {/* Événements à venir */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200 transition-all duration-300 hover:shadow-sm hover:scale-102 h-full">
          <div className="flex items-center justify-center flex-col h-full">
            <p className="text-xs font-medium text-green-600 mb-1">À venir</p>
            <p className="text-lg font-bold text-green-900">{upcomingEvents}</p>
          </div>
        </div>

        {/* Mes événements */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200 transition-all duration-300 hover:shadow-sm hover:scale-102 h-full">
          <div className="flex items-center justify-center flex-col h-full">
            <p className="text-xs font-medium text-purple-600 mb-1">
              Mes événements
            </p>
            <p className="text-lg font-bold text-purple-900">{myEvents}</p>
          </div>
        </div>

        {/* Créneaux disponibles - uniquement pour admins/advisors */}
        {!isStudent && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200 transition-all duration-300 hover:shadow-sm hover:scale-105 h-full">
            <div className="text-center">
              <p className="text-xs font-medium text-orange-600 mb-1">Libres</p>
              <p className="text-lg font-bold text-orange-900">
                {availableSlots}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Répartition par type - uniquement pour admins/advisors */}
      {!isStudent && topEventTypes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-600 mb-2">
            Répartition par type
          </h4>
          <div className="space-y-1">
            {topEventTypes.map(([eventType, count]) => (
              <div
                key={eventType}
                className="flex items-center justify-between text-xs"
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                    eventType
                  )}`}
                >
                  {getEventTypeLabel(eventType)}
                </span>
                <span className="font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarStats;
