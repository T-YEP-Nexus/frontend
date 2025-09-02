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
}

const CalendarStats: React.FC<CalendarStatsProps> = ({
  totalEvents,
  eventsByType,
  upcomingEvents,
  myEvents,
  totalSlots,
  availableSlots,
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Statistiques du calendrier
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total des événements */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total événements</p>
              <p className="text-2xl font-bold text-blue-900">{totalEvents}</p>
            </div>
          </div>
        </div>

        {/* Événements à venir */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">À venir</p>
              <p className="text-2xl font-bold text-green-900">{upcomingEvents}</p>
            </div>
          </div>
        </div>

        {/* Mes événements */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Mes événements</p>
              <p className="text-2xl font-bold text-purple-900">{myEvents}</p>
            </div>
          </div>
        </div>

        {/* Créneaux disponibles */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">Créneaux libres</p>
              <p className="text-2xl font-bold text-orange-900">{availableSlots}</p>
              <p className="text-xs text-orange-600">sur {totalSlots}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par type */}
      {topEventTypes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Répartition par type</h4>
          <div className="space-y-2">
            {topEventTypes.map(([eventType, count]) => (
              <div key={eventType} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(eventType)}`}>
                    {getEventTypeLabel(eventType)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / totalEvents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarStats;
