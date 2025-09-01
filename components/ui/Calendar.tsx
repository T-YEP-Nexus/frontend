"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
import ModalEventDetails from "./ModalEventDetails";
import CalendarFilters from "./CalendarFilters";
import CalendarStats from "./CalendarStats";

import { useCalendarData, type CalendarEvent } from "@/hooks/useCalendarData";
import usePromotionsData from "@/hooks/usePromotionsData";
import { getUserData } from "@/lib/userData";
import { getUserIdFromToken } from "@/lib/auth";
import AdminLoading from "@/components/admin/AdminLoading";

interface CalendarProps {
  role?: "admin" | "advisor" | "student";
}

const Calendar: React.FC<CalendarProps> = ({ role }) => {
  const {
    events: backendEvents,
    loading,
    error,
    fetchAllEvents,
    fetchEventsByStudent,
    updateEvent,
    createEvent,
    deleteEvent,
    registerToEvent,
    registerToSlot,
    unregisterFromEvent,
    unregisterFromSlot,
    checkUserRegistration,
  } = useCalendarData();

  const { promotions } = usePromotionsData();

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
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventDetails, setEventDetails] = useState<any | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const calendarRef = useRef<FullCalendar>(null);

  const effectiveRole = role || userRole;
  const isAdmin = effectiveRole === "admin" || effectiveRole === "advisor";
  const isStudent = effectiveRole === "student";

  const refreshCalendarData = useCallback(() => {
    const userId = getUserIdFromToken();
    if (isAdmin) {
      fetchAllEvents();
    } else if (isStudent && userId) {
      fetchEventsByStudent(userId);
    }
  }, [isAdmin, isStudent, fetchAllEvents, fetchEventsByStudent]);

  useEffect(() => {
    const setupAndLoad = async () => {
      let finalRole: "admin" | "advisor" | "student" = role || "student";
      let userId = getUserIdFromToken();

      if (!role && userId) {
        try {
          const fullUserData = await getUserData(userId);
          const detectedRole = fullUserData.role || "student";
          finalRole = ["admin", "advisor"].includes(detectedRole.toLowerCase())
            ? (detectedRole.toLowerCase() as "admin" | "advisor")
            : "student";
        } catch (error) {
          console.error("Erreur lors du chargement du rôle:", error);
        }
      }

      setUserRole(finalRole);
      setRoleLoading(false);

      if (finalRole === "admin" || finalRole === "advisor") {
        setPermissions({
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
        fetchAllEvents();
      } else {
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
        if (userId) fetchEventsByStudent(userId);
      }
    };

    setupAndLoad();
  }, [role, fetchAllEvents, fetchEventsByStudent]);

  useEffect(() => {
    if (effectiveRole === "student" && selectedPromotions.length > 0) {
      setSelectedPromotions([]);
    }
  }, [effectiveRole, selectedPromotions]);

  useEffect(() => {
    if (!loading && !error && backendEvents) {
      let calendarEvents = backendEvents
        .map((event: CalendarEvent) => {
          const typedEvent = event as CalendarEvent;
          if (
            !typedEvent.id ||
            !typedEvent.title ||
            !typedEvent.event_datetime ||
            !typedEvent.duration_minutes
          ) {
            console.warn("Événement invalide ou incomplet détecté:", typedEvent);
            return null;
          }

          let start = new Date(typedEvent.event_datetime);
          let end = new Date(
            start.getTime() + typedEvent.duration_minutes * 60000
          );

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("Dates invalides pour l'événement:", typedEvent.id, {
              start,
              end,
            });
            return null;
          }

          if (isStudent && typedEvent.slots && Array.isArray(typedEvent.slots)) {
            const userId = getUserIdFromToken();
            const mySlot = typedEvent.slots.find(
              (slot: any) => slot.user === userId
            );
            if (mySlot && mySlot.start && mySlot.end) {
              start = new Date(mySlot.start);
              end = new Date(mySlot.end);
            }
          }

          return {
            id: String(typedEvent.id),
            title: typedEvent.title,
            start,
            end,
            color: getEventColor(typedEvent.event_type),
            description: typedEvent.description || "",
            event_type: typedEvent.event_type || "other",
            location: typedEvent.location || "",
            report: typedEvent.report || "",
            id_creator: typedEvent.id_creator || "",
            target_promotions: Array.isArray(typedEvent.target_promotions)
              ? typedEvent.target_promotions
              : [],
            slots: Array.isArray(typedEvent.slots) ? typedEvent.slots : [],
            created_at: typedEvent.created_at || "",
            registration_id: typedEvent.registration_id,
            allow_multiple_users: typedEvent.allow_multiple_users,
            slot_duration: typedEvent.slot_duration,
          };
        })
        .filter((event) => event !== null);

      let filteredEvents = calendarEvents;

      if (selectedEventTypes.length > 0) {
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.event_type && selectedEventTypes.includes(event.event_type)
        );
      }

      if (
        selectedPromotions.length > 0 &&
        (effectiveRole === "admin" || effectiveRole === "advisor")
      ) {
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.target_promotions &&
            event.target_promotions.some((promo: string) =>
              selectedPromotions.includes(promo)
            )
        );
      }

      if (showOnlyMyEvents) {
        const userId = getUserIdFromToken();
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.slots &&
            event.slots.some((slot: any) => slot.user === userId)
        );
      }

      setEvents(filteredEvents);
    }
  }, [
    backendEvents,
    loading,
    error,
    isStudent,
    selectedEventTypes,
    selectedPromotions,
    showOnlyMyEvents,
    effectiveRole,
  ]);

  const getEventColor = (eventType: string) => {
    if (!eventType || typeof eventType !== "string") {
      return "#6b7280";
    }

    switch (eventType) {
      case "follow-up":
        return "#10b981";
      case "kick-off":
        return "#f59e0b";
      case "keynote":
        return "#8b5cf6";
      case "hub-talk":
        return "#06b6d4";
      case "other":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const openModal = (start: Date, end: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const toInput = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setModalData({ start: toInput(start), end: toInput(end) });
    setModalOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!permissions.canCreateEvents) return;
    openModal(selectInfo.start, selectInfo.end ?? selectInfo.start);
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    if (!permissions.canCreateEvents) return;
    const start = clickInfo.date;
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    openModal(start, end);
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const eventId = Number(clickInfo.event.id);
    const event = backendEvents.find((e) => e.id === eventId);

    if (!event) {
      console.error("Aucun événement trouvé pour cet id", eventId);
      return;
    }

    const eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      event_type: event.event_type,
      description: event.description,
      location: event.location,
      target_promotions: event.target_promotions || [],
      slots: event.slots || [],
      report: event.report,
      id_creator: event.id_creator,
      created_at: event.created_at,
      allow_multiple_users: event.allow_multiple_users,
      slot_duration: event.slot_duration,
    };

    if (isAdmin) {
      setEventDetails(eventData);
      setShowEventDetailsModal(true);
    } else if (isStudent) {
      const isRegistered = await checkUserRegistration(eventId);
      setSelectedEvent(eventData);
      setIsUserRegistered(isRegistered);
      setShowRegistrationModal(true);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      await deleteEvent(eventId);
      refreshCalendarData();
      setShowEventDetailsModal(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const handleRegisterSlot = async (eventId: number, slotIndex: number) => {
    await registerToSlot(eventId, slotIndex);
    refreshCalendarData();
  };

  const handleUnregisterSlot = async (eventId: number, slotIndex: number) => {
    await unregisterFromSlot(eventId, slotIndex);
    refreshCalendarData();
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    if (!permissions.canEditEvents) return;

    const eventId = Number(dropInfo.event.id);
    const newStartDate = dropInfo.event.start;

    if (!newStartDate) {
      console.error("La date de début est invalide après le déplacement.");
      dropInfo.revert();
      return;
    }

    try {
      await updateEvent(eventId, {
        start: newStartDate.toISOString(),
      } as Partial<CalendarEvent>);
      refreshCalendarData();
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'événement:",
        error.message
      );
      alert("La mise à jour de l'événement a échoué.");
      dropInfo.revert();
    }
  };

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
      <CalendarStats
        totalEvents={events.length}
        eventsByType={events.reduce((acc, event) => {
          const type = event.event_type || "other";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)}
        upcomingEvents={
          events.filter(
            (event) => event.start && new Date(event.start) > new Date()
          ).length
        }
        myEvents={
          events.filter(
            (event) =>
              event.slots &&
              event.slots.some(
                (slot: any) => slot.user === getUserIdFromToken()
              )
          ).length
        }
        totalSlots={events.reduce(
          (total, event) => total + (event.slots?.length || 0),
          0
        )}
        availableSlots={events.reduce(
          (total, event) =>
            total + (event.slots?.filter((slot: any) => !slot.user).length || 0),
          0
        )}
      />

      <CalendarFilters
        eventTypes={["follow-up", "kick-off", "keynote", "hub-talk", "other"]}
        selectedEventTypes={selectedEventTypes}
        onEventTypesChange={setSelectedEventTypes}
        promotions={promotions || []}
        selectedPromotions={selectedPromotions}
        onPromotionsChange={(promotions) => {
          if (effectiveRole === "admin" || effectiveRole === "advisor") {
            setSelectedPromotions(promotions);
          } else {
            setSelectedPromotions([]);
          }
        }}
        showOnlyMyEvents={showOnlyMyEvents}
        onShowOnlyMyEventsChange={setShowOnlyMyEvents}
        onClearFilters={() => {
          setSelectedEventTypes([]);
          if (effectiveRole === "admin" || effectiveRole === "advisor") {
            setSelectedPromotions([]);
          }
          setShowOnlyMyEvents(false);
        }}
        userRole={effectiveRole || undefined}
      />

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
          createEvent={async (data) => {
            await createEvent(data);
            refreshCalendarData();
          }}
          updateEvent={async (id, data) => {
            await updateEvent(id, data);
            refreshCalendarData();
          }}
          deleteEvent={handleDeleteEvent}
        />
      )}

      <ModalEventDetails
        open={showEventDetailsModal}
        onClose={() => setShowEventDetailsModal(false)}
        event={eventDetails}
        userRole={effectiveRole || undefined}
        onEdit={(event) => {
          setEventToEdit(event);
          setShowEventDetailsModal(false);
          setModalOpen(true);
        }}
        onDelete={(eventId) => handleDeleteEvent(Number(eventId))}
      />

      {isAdmin && eventToDelete && (
        <ModalDeleteEvent
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          event={eventToDelete}
          onConfirm={() => handleDeleteEvent(Number(eventToDelete.id))}
        />
      )}

      {isStudent && selectedEvent && (
        <ModalEventRegistration
          open={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          event={selectedEvent}
          isRegistered={isUserRegistered}
          onRegister={async (eventId) => {
            await registerToEvent(eventId);
            refreshCalendarData();
          }}
          onRegisterSlot={handleRegisterSlot}
          onUnregister={async (eventId) => {
            await unregisterFromEvent(eventId);
            refreshCalendarData();
          }}
          onUnregisterSlot={handleUnregisterSlot}
        />
      )}

      <style jsx global>{`
        /* ... (tous les styles de la branche develop) ... */
        .fc {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          width: 100% !important;
          max-width: 100% !important;
        }
        .fc .fc-toolbar {
          padding: 2rem 3rem 1.5rem 3rem;
          margin: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }
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
        .fc .fc-button-group .fc-button.fc-button-active {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
          z-index: 1;
        }
        .fc .fc-button.fc-today-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }
        .fc .fc-col-header-cell-cushion {
          font-weight: 600;
          color: #475569;
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
        .fc .fc-event {
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .admin-calendar .fc .fc-timegrid-slot-lane:hover {
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        .admin-calendar .fc .fc-daygrid-day:hover {
           background-color: rgba(59, 130, 246, 0.05) !important;
        }
        .fc .fc-event {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Calendar;