"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface EventType {
  value: string;
  label: string;
  color: string;
}

interface EventTypeDropdownProps {
  selectedEventType: string;
  onEventTypeChange: (eventType: string) => void;
  placeholder?: string;
  required?: boolean;
}

const eventTypes: EventType[] = [
  { value: "other", label: "Autre", color: "#6b7280" },
  { value: "follow-up", label: "Follow-up", color: "#10b981" },
  { value: "kick-off", label: "Kick-off", color: "#f59e0b" },
  { value: "keynote", label: "Keynote", color: "#8b5cf6" },
  { value: "hub-talk", label: "Hub-talk", color: "#06b6d4" },
];

const EventTypeDropdown: React.FC<EventTypeDropdownProps> = ({
  selectedEventType,
  onEventTypeChange,
  placeholder = "Sélectionner un type d'événement",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedType = eventTypes.find(
    (type) => type.value === selectedEventType
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white cursor-pointer ${
          isOpen ? "ring-2 ring-blue-500 border-transparent" : ""
        } ${required && selectedEventType === "" ? "border-red-300" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedType ? (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedType.color }}
                />
                <span className="text-gray-900 font-medium">
                  {selectedType.label}
                </span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {eventTypes.map((type) => (
            <div
              key={type.value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => {
                onEventTypeChange(type.value);
                setIsOpen(false);
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-gray-900">{type.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventTypeDropdown;
