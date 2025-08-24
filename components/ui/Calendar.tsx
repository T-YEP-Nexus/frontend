"use client";

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import ModalEventForm from "./ModalEventForm";
import ModalDeleteEvent from "./ModalDeleteEvent";
import ModalEventRegistration from "./ModalEventRegistration";
import { useCalendarData } from "@/hooks/useCalendarData";
import { getUserData } from "@/lib/userData";
import { getUserIdFromToken } from "@/lib/auth";
import AdminLoading from "@/components/admin/AdminLoading";

// Ajout de la prop role
interface CalendarProps {
  role?: "admin" | "advisor" | "student";
}

type CalendarEventInput = EventInput & {
  id: string;
  extendedProps: {
    slots?: { start: string; end: string; user: string | null }[];
    [key: string]: any;
  };
};

const Calendar: React.FC<CalendarProps> = ({ role }) => {
  const {
    events: backendEvents,
    loading,
    error,
    fetchAllEvents,
    fetchStudentAgenda,
    updateEvent,
    createEvent,
    deleteEvent,
    registerToEvent,
    unregisterFromEvent,
    checkUserRegistration,
  } = useCalendarData();

  const [userRole, setUserRole] = useState<
    "admin" | "advisor" | "student" | null
  >(null);
  const [permissions, setPermissions] = useState({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canRegisterToEvents: false,
    canUnregisterFromEvents: false,
  });
  const [roleLoading, setRoleLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  // Charger le rôle utilisateur et les permissions
  useEffect(() => {
    const setupPermissionsAndLoadData = async () => {
      let finalRole: "admin" | "advisor" | "student" = role || "student"; // Priorité à la prop, fallback à student
      let userId = getUserIdFromToken();

      if (!role) {
        // Si pas de prop, détecter le rôle de l'utilisateur connecté
        try {
          if (!userId) {
            setRoleLoading(false);
            return;
          }
          const fullUserData = await getUserData(userId);
          const detectedRole = fullUserData.role || "student";
          finalRole = ["admin", "advisor"].includes(detectedRole.toLowerCase())
            ? (detectedRole.toLowerCase() as "admin" | "advisor")
            : "student";
        } catch (error) {
          console.error("Erreur lors du chargement du rôle:", error);
          finalRole = "student"; // Fallback en cas d'erreur
        }
      }

      setUserRole(finalRole);

      // Définir les permissions en fonction du rôle final
      if (finalRole === "admin" || finalRole === "advisor") {
        setPermissions({
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
        fetchAllEvents(); // Les admins/advisors voient tous les événements
      } else {
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
        if (userId) {
          fetchStudentAgenda(userId); // Les étudiants voient leur agenda
        }
      }
      setRoleLoading(false);
    };

    setupPermissionsAndLoadData();
  }, [role, fetchAllEvents, fetchStudentAgenda]);

  // DEBUG : log du rôle et des permissions
  console.log("userRole", userRole, "permissions", permissions);
  // Forçage temporaire pour test admin
  // Sélecteur de rôle pour test front
  const [roleSelector, setRoleSelector] = useState<
    "admin" | "advisor" | "student"
  >("student");
  // Si la prop role est fournie, on l'utilise, sinon on prend la détection auto, puis le sélecteur
  const effectiveRole = role || userRole || roleSelector;
  const isAdmin = effectiveRole === "admin" || effectiveRole === "advisor";
  const isStudent = effectiveRole === "student";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    title: string;
    start?: Date | string;
    end?: Date | string;
    slots?: any[];
  } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    start?: Date | string;
    end?: Date | string;
    event_type?: string;
    description?: string;
    color?: string;
  } | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const calendarRef = useRef<FullCalendar>(null);

  // Synchroniser les événements du backend avec le calendrier
  useEffect(() => {
    if (!loading && !error) {
      let calendarEvents = backendEvents.map((event: any) => {
        // Par défaut, on affiche l'événement sur toute la plage
        let start = new Date(event.event_datetime);
        let end = new Date(
          new Date(event.event_datetime).getTime() +
            event.duration_minutes * 60000
        );
        // Si étudiant et inscrit à un slot, on rétrécit l'affichage
        if (isStudent && event.slots && Array.isArray(event.slots)) {
          const userId = getUserIdFromToken();
          const mySlot = event.slots.find((slot: any) => slot.user === userId);
          if (mySlot) {
            start = new Date(mySlot.start);
            end = new Date(mySlot.end);
          }
        }
        return {
          id: String(event.id),
          title: event.title,
          start,
          end,
          color: getEventColor(event.event_type),
          description: event.description,
          event_type: event.event_type,
          report: event.report,
          id_creator: event.id_creator,
          slots: event.slots || undefined,
        };
      });
      setEvents(calendarEvents);
    }
  }, [backendEvents, loading, error, isStudent]);

  // Fonction pour obtenir la couleur selon le type d'événement
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "follow-up":
        return "#10b981"; // vert émeraude
      case "kick-off":
        return "#f59e0b"; // orange
      case "keynote":
        return "#8b5cf6"; // violet
      case "hub-talk":
        return "#06b6d4"; // cyan
      case "other":
        return "#3b82f6"; // bleu
      default:
        return "#6b7280"; // gris
    }
  };

  // Ouvre la modale pour créer un événement
  const openModal = (start: Date, end: Date) => {
    // Format pour input type="datetime-local" en heure locale
    const pad = (n: number) => n.toString().padStart(2, "0");
    const toInput = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    setModalData({ start: toInput(start), end: toInput(end) });
    setModalOpen(true);
  };

  // Ajout d'un événement par sélection de plage horaire
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!permissions.canCreateEvents) return;
    openModal(selectInfo.start, selectInfo.end ?? selectInfo.start);
  };

  // Ajout d'un événement par simple clic
  const handleDateClick = (clickInfo: DateClickArg) => {
    if (!permissions.canCreateEvents) return;
    const start = clickInfo.date;
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    openModal(start, end);
  };

  // Génération de créneaux lors de la création d'un événement (créneaux de 30 min par défaut)
  const handleModalSubmit = ({
    title,
    start,
    end,
    slotDuration,
  }: {
    title: string;
    start: string;
    end: string;
    slotDuration: number;
  }) => {
    // Générer les créneaux selon la durée choisie
    const slots: { start: string; end: string; user: string | null }[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let current = new Date(startDate);
    while (current < endDate) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);
      if (slotEnd > endDate) break;
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        user: null,
      });
      current = slotEnd;
    }
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title,
        start,
        end,
        color: "#3b82f6",
        extendedProps: {
          slots,
        },
      },
    ]);
    setModalOpen(false);
    setModalData(null);
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const eventId = Number(clickInfo.event.id);
    const event = backendEvents.find((e) => e.id === eventId);

    if (!event) {
      console.error("Aucun événement trouvé pour cet id", eventId);
      return;
    }

    if (isAdmin) {
      // Les admins et advisors ouvrent la modale d'édition
      setEventToEdit(event);
      setModalOpen(true);
    } else if (isStudent) {
      // Les étudiants ouvrent la modale d'inscription
      const isRegistered = await checkUserRegistration(eventId);
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        event_type: event.event_type,
        description: event.description,
        color:
          (clickInfo.event as any).backgroundColor ||
          (clickInfo.event as any).color,
      });
      setIsUserRegistered(isRegistered);
      setShowRegistrationModal(true);
    }
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  // Gérer le déplacement d'un événement (drag & drop)
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    if (!permissions.canEditEvents) return;

    const eventId = Number(dropInfo.event.id);
    const newStartDate = dropInfo.event.start;

    if (!newStartDate) {
      console.error("La date de début est invalide après le déplacement.");
      dropInfo.revert(); // Annuler le déplacement sur le calendrier
      return;
    }

    // Formater la date pour le backend
    const isoDateString = newStartDate.toISOString();
    const formattedStartDate =
      isoDateString.replace("T", " ").substring(0, 19) + "+00";

    try {
      await updateEvent(eventId, { event_datetime: formattedStartDate });
      // Pas besoin de re-fetch, car FullCalendar met déjà à jour l'UI.
      // fetchAllEvents() pourrait être appelé si vous voulez rafraîchir toutes les données.
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'événement:",
        error.message
      );
      alert(
        "La mise à jour de l'événement a échoué. L'événement va être replacé à sa position d'origine."
      );
      dropInfo.revert(); // Annuler le changement visuel en cas d'erreur
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === dropInfo.event.id
          ? {
              ...e,
              start: dropInfo.event.start,
              end: dropInfo.event.end,
            }
          : e
      )
    );
  };

  // Afficher un message de chargement ou d'erreur
  if (loading || roleLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-center h-[600px]">
          <AdminLoading message="Chargement des événements..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <p className="text-red-600 mb-2 text-lg font-semibold">
              Erreur de chargement
            </p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full ${
        isAdmin ? "admin-calendar" : ""
      }`}
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView={currentView}
        locale={frLocale}
        headerToolbar={{
          left: "prev today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay next",
        }}
        views={{
          timeGridDay: {
            titleFormat: { year: "numeric", month: "long", day: "numeric" },
            slotMinTime: "06:00:00",
            slotMaxTime: "22:00:00",
            slotDuration: "01:00:00",
            slotLabelInterval: "02:00:00",
            allDaySlot: false,
          },
          timeGridWeek: {
            titleFormat: { year: "numeric", month: "long", day: "numeric" },
            slotMinTime: "06:00:00",
            slotMaxTime: "22:00:00",
            slotDuration: "01:00:00",
            slotLabelInterval: "02:00:00",
            allDaySlot: false,
          },
          dayGridMonth: {
            titleFormat: { year: "numeric", month: "long" },
            dayHeaderFormat: { weekday: "short" },
          },
        }}
        height={800}
        events={events}
        nowIndicator={true}
        dayHeaderFormat={{ weekday: "short", day: "numeric", month: "short" }}
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        expandRows={true}
        selectable={permissions.canCreateEvents}
        editable={permissions.canEditEvents}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
      {permissions.canCreateEvents && (
        <ModalEventForm
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEventToEdit(null);
          }}
          defaultStart={modalData?.start}
          defaultEnd={modalData?.end}
          eventToEdit={eventToEdit}
          createEvent={createEvent}
          updateEvent={updateEvent}
          deleteEvent={deleteEvent}
        />
      )}
      {/* Modal admin : détail, créneaux/inscrits et suppression */}
      {isAdmin && eventToDelete && (
        <ModalDeleteEvent
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          event={eventToDelete}
          onConfirm={handleDeleteEvent}
        />
      )}
      {isStudent && selectedEvent && (
        <>
          <ModalEventRegistration
            open={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            event={selectedEvent}
            isRegistered={isUserRegistered}
            onRegister={registerToEvent}
            onUnregister={unregisterFromEvent}
          />

          {eventToDelete && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                deleteModalOpen
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ${
                  deleteModalOpen
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{
                  transform: deleteModalOpen
                    ? "translateY(0) scale(1)"
                    : "translateY(2rem) scale(0.95)",
                }}
              >
                {/* Header de la modale */}
                <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 text-white rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          Détail de l'événement
                        </h2>
                        <p className="text-red-100 text-sm">
                          Gestion des créneaux et inscriptions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contenu de la modale */}
                <div className="p-6 space-y-6">
                  {/* Informations de l'événement */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Informations générales
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Titre</p>
                        <p className="font-semibold text-gray-900">
                          {eventToDelete.title}
                        </p>
                      </div>
                      {eventToDelete.start && eventToDelete.end && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Horaires</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(eventToDelete.start).toLocaleString(
                              "fr-FR",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(eventToDelete.end).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Liste des créneaux/inscrits si slots présents */}
                  {Array.isArray(eventToDelete.slots) &&
                    eventToDelete.slots.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Créneaux et inscriptions ({eventToDelete.slots.length}
                          )
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {eventToDelete.slots.map((slot: any, idx: number) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                                slot.user
                                  ? "bg-white border-green-200 shadow-sm"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    slot.user ? "bg-green-100" : "bg-gray-100"
                                  }`}
                                >
                                  <svg
                                    className={`w-4 h-4 ${
                                      slot.user
                                        ? "text-green-600"
                                        : "text-gray-400"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {new Date(slot.start).toLocaleTimeString(
                                      "fr-FR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}{" "}
                                    -{" "}
                                    {new Date(slot.end).toLocaleTimeString(
                                      "fr-FR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {slot.user ? "Inscrit" : "Disponible"}
                                  </p>
                                </div>
                              </div>
                              {slot.user && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {slot.user}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Boutons d'action */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Voulez-vous vraiment supprimer cet événement ?"
                          )
                        ) {
                          handleDeleteEvent();
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Supprimer l'événement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Style personnalisé FullCalendar - Design moderne */}
      <style jsx global>{`
        /* Container principal */
        .fc {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          width: 100% !important;
          max-width: 100% !important;
        }

        .fc .fc-view-harness {
          width: 100% !important;
          max-width: none !important;
        }

        .fc .fc-scroller {
          width: 100% !important;
          max-width: none !important;
        }

        .fc .fc-scroller-liquid {
          width: 100% !important;
          max-width: none !important;
        }

        .fc .fc-scroller-liquid-absolute {
          width: 100% !important;
          max-width: none !important;
        }

        .fc .fc-timegrid-body {
          width: 100% !important;
          max-width: none !important;
        }

        .fc .fc-timegrid-axis {
          width: auto !important;
        }

        .fc .fc-timegrid-slot-lane {
          width: 100% !important;
        }

        /* Toolbar moderne */
        .fc .fc-toolbar {
          padding: 2rem 3rem 1.5rem 3rem;
          margin: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .fc .fc-toolbar-chunk {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .fc .fc-toolbar-chunk:first-child {
          min-width: 200px;
        }

        .fc .fc-toolbar-chunk:last-child {
          min-width: 200px;
          justify-content: flex-end;
        }

        .fc .fc-toolbar-center {
          justify-content: center;
          flex: 1;
        }

        /* Boutons modernes */
        .fc .fc-button {
          background: white;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          min-width: 40px;
          min-height: 40px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .fc .fc-button:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .fc .fc-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .fc .fc-button:active {
          transform: translateY(0);
        }

        /* Boutons de vue */
        .fc .fc-button-group {
          display: flex;
          gap: 0;
          border: none !important;
          box-shadow: none !important;
        }

        .fc .fc-button-group .fc-button {
          border-radius: 0.5rem;
          margin: 0;
          border: 2px solid #e2e8f0 !important;
          border-right: 1px solid #e2e8f0 !important;
          border-left: 1px solid #e2e8f0 !important;
        }

        .fc .fc-button-group .fc-button:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-left: 2px solid #e2e8f0 !important;
        }

        .fc .fc-button-group .fc-button:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          border-right: 2px solid #e2e8f0 !important;
        }

        .fc .fc-button-group .fc-button:not(:first-child):not(:last-child) {
          border-radius: 0;
        }

        .fc .fc-button-group .fc-button.fc-button-active {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
          z-index: 1;
        }

        .fc .fc-button-group .fc-button:hover {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Bouton Today spécial */
        .fc .fc-button.fc-today-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          min-width: 120px;
          min-height: 40px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          margin: 0 1rem;
        }

        .fc .fc-button.fc-today-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .fc .fc-button.fc-today-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .fc .fc-button.fc-today-button:disabled {
          background: linear-gradient(
            135deg,
            #3b82f6 0%,
            #2563eb 100%
          ) !important;
          color: white !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }

        /* Titre du calendrier */
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          width: 100%;
          letter-spacing: -0.025em;
        }

        /* En-têtes des colonnes */
        .fc .fc-col-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .fc .fc-col-header-cell {
          border: none;
          padding: 1rem 0;
        }

        .fc .fc-col-header-cell-cushion {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: #475569;
          text-decoration: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .fc .fc-col-header-cell-cushion:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Cellules du calendrier */
        .fc .fc-timegrid-slot {
          border-color: #f1f5f9;
          height: 50px;
        }

        .fc .fc-timegrid-slot-label {
          border-color: #f1f5f9;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
        }

        .fc .fc-timegrid-slot-lane {
          border-color: #f1f5f9;
        }

        .fc .fc-timegrid-axis {
          border-color: #f1f5f9;
          background: #f8fafc;
        }

        /* Vue mois */
        .fc .fc-daygrid-day {
          border-color: #f1f5f9;
          min-height: 120px;
        }

        .fc .fc-daygrid-day-frame {
          min-height: 120px;
        }

        .fc .fc-daygrid-day-number {
          color: #475569;
          font-weight: 600;
          padding: 0.5rem;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(59, 130, 246, 0.05);
        }

        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.25rem;
        }

        /* Événements */
        .fc .fc-event {
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
          margin: 1px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .fc .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .fc .fc-event-main {
          padding: 0;
        }

        .fc .fc-event-title {
          font-weight: 600;
          line-height: 1.2;
        }

        .fc .fc-event-time {
          font-weight: 500;
          opacity: 0.9;
        }

        /* Indicateur "maintenant" */
        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #ef4444;
          border-width: 5px;
        }

        /* Sélection de plage */
        .fc .fc-highlight {
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.5rem;
        }

        /* Scrollbars personnalisées */
        .fc .fc-timegrid-body {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .fc .fc-timegrid-body::-webkit-scrollbar {
          width: 8px;
        }

        .fc .fc-timegrid-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .fc .fc-timegrid-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .fc .fc-timegrid-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Hover sur les cases du calendrier - UNIQUEMENT pour les admins */
        .admin-calendar .fc .fc-timegrid-slot {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .admin-calendar .fc .fc-timegrid-slot:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Cibler uniquement les cellules individuelles par jour - UNIQUEMENT pour les admins */
        .admin-calendar .fc .fc-timegrid-col .fc-timegrid-slot {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .admin-calendar .fc .fc-timegrid-col .fc-timegrid-slot:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Solution finale : cibler uniquement les cellules individuelles - UNIQUEMENT pour les admins */
        .admin-calendar .fc .fc-timegrid-slot-lane .fc-timegrid-slot {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .admin-calendar .fc .fc-timegrid-slot-lane .fc-timegrid-slot:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Hover sur les jours dans la vue mois - UNIQUEMENT pour les admins */
        .admin-calendar .fc .fc-daygrid-day {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .admin-calendar .fc .fc-daygrid-day:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Hover sur les cellules d'événements - UNIQUEMENT pour les admins */
        .admin-calendar .fc .fc-daygrid-day-events {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        /* Curseur pointer sur les événements pour tous les utilisateurs */
        .fc .fc-event {
          cursor: pointer;
        }

        .fc .fc-daygrid-day-events:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .fc .fc-toolbar-chunk {
            min-width: auto;
            justify-content: center;
          }

          .fc .fc-toolbar-title {
            font-size: 1.25rem;
          }

          .fc .fc-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }

          .fc .fc-button.fc-today-button {
            padding: 0.375rem 1rem;
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
