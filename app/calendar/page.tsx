"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Calendar from "@/components/ui/Calendar";
import ModalEventRegistration from "@/components/ui/ModalEventRegistration";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import Header from "@/components/Header/Header";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

const AgendaPlaceholder = () => (
  <div className="w-full h-[500px] bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-2xl text-gray-400 font-bold transition-all duration-300 hover:shadow-2xl">
    (Ici s'affichera l'agenda de l'étudiant)
  </div>
);

const CalendarPage = () => {
  const [selected, setSelected] = useState<"calendrier" | "agenda">(
    "calendrier"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("Tous");
  const filterRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { isLoading: roleLoading } = useRoleRedirect();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationEvent, setRegistrationEvent] = useState<any | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const actionsRef = useRef<{
    onRegister: (eventId: number) => Promise<void>;
    onRegisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
    onUnregister: (eventId: number) => Promise<void>;
    onUnregisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  // Supprime le double chargement: on laisse le composant Calendar gérer son propre loading

  return (
    <div className="min-h-screen px-8 sm:px-12 lg:px-20 py-6 sm:py-8 lg:py-12">
      <Header
        title="Calendrier"
        description="Consultez et gérez vos événements à venir"
      />

      {/* Calendrier ou Agenda */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-transparent flex justify-center">
          <div className="w-full max-w-7xl">
            {selected === "calendrier" ? (
              isClient ? (
                <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.005]">
                  <Calendar
                    onStudentRegisterOpen={({
                      event,
                      isRegistered,
                      actions,
                    }) => {
                      setRegistrationEvent(event);
                      setIsUserRegistered(isRegistered);
                      actionsRef.current = actions;
                      setShowRegistrationModal(true);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-[600px]" />
              )
            ) : (
              <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
                <AgendaPlaceholder />
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalEventRegistration
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        event={registrationEvent}
        isRegistered={isUserRegistered}
        onRegister={async (eventId: number) => {
          if (actionsRef.current) await actionsRef.current.onRegister(eventId);
        }}
        onRegisterSlot={async (eventId: number, slotIndex: number) => {
          if (actionsRef.current)
            await actionsRef.current.onRegisterSlot(eventId, slotIndex);
        }}
        onUnregister={async (eventId: number) => {
          if (actionsRef.current)
            await actionsRef.current.onUnregister(eventId);
        }}
        onUnregisterSlot={async (eventId: number, slotIndex: number) => {
          if (actionsRef.current)
            await actionsRef.current.onUnregisterSlot(eventId, slotIndex);
        }}
      />
    </div>
  );
};

export default CalendarPage;
