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
  onStudentRegisterOpen?: (args: {
    event: any;
    isRegistered: boolean;
    actions: {
      onRegister: (eventId: number) => Promise<void>;
      onRegisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
      onUnregister: (eventId: number) => Promise<void>;
      onUnregisterSlot: (eventId: number, slotIndex: number) => Promise<void>;
    };
  }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ role, onStudentRegisterOpen }) => {
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
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState<any | null>(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const calendarRef = useRef<FullCalendar>(null);

  const effectiveRole = role || userRole;
  const isAdmin = effectiveRole === "admin" || effectiveRole === "advisor";
  const isStudent = effectiveRole === "student";
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

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
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    const desiredView = isMobile
      ? "timeGridDay"
      : isTablet
      ? "timeGridWeek"
      : "timeGridWeek";
    if (api.view.type !== desiredView) {
      api.changeView(desiredView);
      setCurrentView(desiredView);
    }
  }, [isMobile, isTablet]);

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
            console.warn(
              "Événement invalide ou incomplet détecté:",
              typedEvent
            );
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

          if (
            isStudent &&
            typedEvent.slots &&
            Array.isArray(typedEvent.slots)
          ) {
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
            event.slots && event.slots.some((slot: any) => slot.user === userId)
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
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
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
      if (onStudentRegisterOpen) {
        onStudentRegisterOpen({
          event: eventData,
          isRegistered,
          actions: {
            onRegister: async (id: number) => {
              try {
                await registerToEvent(id);
                // Mise à jour optimiste du state local
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event.id === id 
                      ? { ...event, registration_id: Date.now() } // ID temporaire
                      : event
                  )
                );
              } catch (error) {
                console.error("Erreur lors de l'inscription:", error);
                refreshCalendarData();
              }
            },
            onRegisterSlot: async (id: number, slotIndex: number) => {
              try {
                await registerToSlot(id, slotIndex);
                // Mise à jour optimiste du state local
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event.id === id 
                      ? { 
                          ...event, 
                          registration_id: Date.now(),
                          slots: event.slots?.map((slot: any, index: number) => 
                            index === slotIndex 
                              ? { ...slot, user: 'current_user' }
                              : slot
                          )
                        }
                      : event
                  )
                );
              } catch (error) {
                console.error("Erreur lors de l'inscription au créneau:", error);
                refreshCalendarData();
              }
            },
            onUnregister: async (id: number) => {
              try {
                await unregisterFromEvent(id);
                // Mise à jour optimiste du state local
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event.id === id 
                      ? { ...event, registration_id: undefined }
                      : event
                  )
                );
              } catch (error) {
                console.error("Erreur lors de la désinscription:", error);
                refreshCalendarData();
              }
            },
            onUnregisterSlot: async (id: number, slotIndex: number) => {
              try {
                await unregisterFromSlot(id, slotIndex);
                // Mise à jour optimiste du state local
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event.id === id 
                      ? { 
                          ...event, 
                          registration_id: undefined,
                          slots: event.slots?.map((slot: any, index: number) => 
                            index === slotIndex 
                              ? { ...slot, user: null }
                              : slot
                          )
                        }
                      : event
                  )
                );
              } catch (error) {
                console.error("Erreur lors de la désinscription du créneau:", error);
                refreshCalendarData();
              }
            },
          },
        });
      }
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      try {
        await deleteEvent(eventId);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        setShowEventDetailsModal(false);
        setDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        refreshCalendarData();
      }
    }
  };

  const handleRegisterSlot = async (eventId: number, slotIndex: number) => {
    try {
      await registerToSlot(eventId, slotIndex);
      // Mise à jour optimiste du state local
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                registration_id: Date.now(),
                slots: event.slots?.map((slot: any, index: number) => 
                  index === slotIndex 
                    ? { ...slot, user: 'current_user' }
                    : slot
                )
              }
            : event
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'inscription au créneau:", error);
      refreshCalendarData();
    }
  };

  const handleUnregisterSlot = async (eventId: number, slotIndex: number) => {
    try {
      await unregisterFromSlot(eventId, slotIndex);
      // Mise à jour optimiste du state local
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                registration_id: undefined,
                slots: event.slots?.map((slot: any, index: number) => 
                  index === slotIndex 
                    ? { ...slot, user: null }
                    : slot
                )
              }
            : event
        )
      );
    } catch (error) {
      console.error("Erreur lors de la désinscription du créneau:", error);
      refreshCalendarData();
    }
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
      // Trouver l'événement original pour récupérer ses slots
      const originalEvent = backendEvents.find(e => e.id === eventId);
      let updatedSlots = originalEvent?.slots;

      // Si l'événement a des slots, recalculer leurs horaires
      if (originalEvent && originalEvent.slots && Array.isArray(originalEvent.slots)) {
        const originalStartTime = new Date(originalEvent.event_datetime);
        const newStartTime = newStartDate;
        const timeDifference = newStartTime.getTime() - originalStartTime.getTime();

        // Recalculer chaque slot avec le décalage horaire
        updatedSlots = originalEvent.slots.map((slot: any) => ({
          ...slot,
          start: new Date(new Date(slot.start).getTime() + timeDifference).toISOString(),
          end: new Date(new Date(slot.end).getTime() + timeDifference).toISOString()
        }));

        console.log(`🕐 Recalcul des slots pour l'événement ${eventId}:`);
        console.log(`   Ancien horaire: ${originalStartTime.toLocaleTimeString()}`);
        console.log(`   Nouvel horaire: ${newStartTime.toLocaleTimeString()}`);
        console.log(`   Décalage: ${timeDifference / (1000 * 60)} minutes`);
      }

      // Mise à jour optimiste de l'interface
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                start: newStartDate.toISOString(),
                slots: updatedSlots 
              }
            : event
        )
      );

      // Envoyer la mise à jour au backend avec les nouveaux slots
      const updateData: any = {
        start: newStartDate.toISOString(),
      };

      // Inclure les slots recalculés s'ils existent
      if (updatedSlots) {
        updateData.slots = updatedSlots;
      }

      await updateEvent(eventId, updateData as Partial<CalendarEvent>);
      
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'événement:",
        error.message
      );
      alert("La mise à jour de l'événement a échoué.");
      dropInfo.revert();
      
      refreshCalendarData();
    }
  };

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
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full transition-all duration-300 hover:shadow-2xl ${
        isAdmin ? "admin-calendar" : ""
      }`}
    >
      {/* Stats et Filtres sur la même ligne */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4 p-4 border-b border-gray-100">
        <div className="flex-1">
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
                total +
                (event.slots?.filter((slot: any) => !slot.user).length || 0),
              0
            )}
            userRole={effectiveRole || undefined}
          />
        </div>

        <div className="self-stretch h-full">
          <CalendarFilters
            eventTypes={[
              "follow-up",
              "kick-off",
              "keynote",
              "hub-talk",
              "other",
            ]}
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
        </div>
      </div>

      {/* Calendrier avec plus d'espacement */}
      <div className="p-2 sm:p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={currentView}
          locale={frLocale}
          headerToolbar={
            isMobile
              ? {
                  left: "prev",
                  center: "title",
                  right: "next",
                }
              : isTablet
              ? {
                  left: "prev",
                  center: "title",
                  right: "timeGridWeek,timeGridDay today next",
                }
              : {
                  left: "prev today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay next",
                }
          }
          views={{
            timeGridDay: {
              titleFormat: { year: "numeric", month: "long", day: "numeric" },
              slotMinTime: "08:00:00",
              slotMaxTime: "19:00:00",
              slotDuration: "01:00:00",
              slotLabelInterval: "02:00:00",
              allDaySlot: false,
            },
            timeGridWeek: {
              titleFormat: { year: "numeric", month: "long", day: "numeric" },
              slotMinTime: "08:00:00",
              slotMaxTime: "19:00:00",
              slotDuration: "01:00:00",
              slotLabelInterval: "02:00:00",
              allDaySlot: false,
            },
            dayGridMonth: {
              titleFormat: { year: "numeric", month: "long" },
              dayHeaderFormat: { weekday: "short" },
              dayMaxEventRows: 3,
            },
          }}
          height={isMobile ? "auto" : isTablet ? 720 : 910}
          contentHeight={isMobile ? "auto" : undefined}
          aspectRatio={isMobile ? 0.9 : 1.35}
          events={events}
          nowIndicator={true}
          dayHeaderFormat={{ weekday: "short", day: "numeric", month: "short" }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventDisplay="block"
          eventContent={(eventInfo) => {
            const event = eventInfo.event;

            // Tronquer le titre si trop long
            const title =
              event.title.length > 20
                ? event.title.substring(0, 20) + "..."
                : event.title;

            return (
              <div className="event-content p-1 h-full flex flex-col justify-between">
                <div className="event-title font-semibold text-[10px] sm:text-xs leading-tight text-white">
                  {title}
                </div>

                <div className="event-time text-[10px] sm:text-xs text-white/70 mt-auto">
                  {eventInfo.timeText}
                </div>
              </div>
            );
          }}
          expandRows={true}
          selectable={permissions.canCreateEvents}
          editable={permissions.canEditEvents}
          eventDrop={handleEventDrop}
          select={handleDateSelect}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

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
            try {
              const newEvent = await createEvent(data);
              setEvents(prevEvents => [...prevEvents, newEvent]);
            } catch (error) {
              console.error("Erreur lors de la création de l'événement:", error);
              refreshCalendarData();
            }
          }}
          updateEvent={async (id, data) => {
            try {
              const updatedEvent = await updateEvent(id, data);
              setEvents(prevEvents => 
                prevEvents.map(event => 
                  event.id === id ? { ...event, ...updatedEvent } : event
                )
              );
            } catch (error) {
              console.error("Erreur lors de la mise à jour de l'événement:", error);
              refreshCalendarData();
            }
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

      <style jsx global>{`
        /* Styles modernisés pour le calendrier */
        .fc {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .fc .fc-toolbar {
          padding: 1.5rem 2rem 1rem 2rem;
          margin: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .fc .fc-button {
          background: white;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          min-width: 40px;
          min-height: 40px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .fc .fc-button:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .fc .fc-button-group .fc-button.fc-button-active {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
          z-index: 1;
        }

        .fc .fc-button.fc-today-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        .fc .fc-button.fc-today-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.025em;
        }

        .fc .fc-col-header-cell-cushion {
          font-weight: 700;
          color: #475569;
          font-size: 0.75rem;
          padding: 1rem 0.5rem;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.08) 0%,
            rgba(59, 130, 246, 0.03) 100%
          );
        }

        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 50%;
          width: 2.75rem;
          height: 2.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.375rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .fc .fc-event {
          border: none;
          border-radius: 0.875rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0.0625rem;
          min-height: 2rem;
          height: 95% !important;
        }

        .fc .fc-event .event-content {
          height: 100% !important;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.0625rem;
        }

        .fc .fc-event .event-title {
          font-weight: 700;
          line-height: 1.2;
        }

        .fc .fc-event .event-type {
          font-weight: 600;
          text-transform: capitalize;
        }

        .fc .fc-event .event-description {
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .fc .fc-event .event-location {
          font-weight: 500;
        }

        .fc .fc-event .event-time {
          font-weight: 600;
          opacity: 0.9;
        }

        /* Forcer la hauteur des événements pour qu'ils prennent tout l'espace disponible */
        .fc .fc-timegrid-event {
          height: 95% !important;
          min-height: 2rem;
        }

        .fc .fc-timegrid-event .fc-event-main {
          height: 100% !important;
        }

        .fc .fc-timegrid-event .fc-event-main-frame {
          height: 100% !important;
        }

        /* Ajuster l'espacement vertical des créneaux */
        .fc .fc-timegrid-slot {
          height: auto !important;
        }

        .fc .fc-timegrid-slot-lane {
          height: auto !important;
        }

        .fc .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .fc .fc-event-main {
          padding: 0.125rem 0.375rem;
          height: 100% !important;
        }

        .admin-calendar .fc .fc-timegrid-slot-lane:hover {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.08) 0%,
            rgba(59, 130, 246, 0.03) 100%
          ) !important;
          transition: background 0.3s ease;
        }

        .admin-calendar .fc .fc-daygrid-day:hover {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.08) 0%,
            rgba(59, 130, 246, 0.03) 100%
          ) !important;
          transition: background 0.3s ease;
        }

        .fc .fc-event {
          cursor: pointer;
        }

        .fc .fc-daygrid-day {
          transition: background 0.3s ease;
        }

        .fc .fc-timegrid-slot {
          transition: background 0.3s ease;
        }

        .fc .fc-timegrid-slot-lane {
          transition: background 0.3s ease;
        }

        .fc .fc-col-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .fc .fc-timegrid-axis {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-right: 1px solid #e2e8f0;
        }

        .fc .fc-timegrid-slot-label {
          font-weight: 600;
          color: #64748b;
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
        }

        .fc .fc-daygrid-day {
          padding: 0.5rem;
        }

        .fc .fc-daygrid-day-number {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
          color: #9ca3af;
        }

        .fc .fc-daygrid-day.fc-day-past .fc-daygrid-day-number {
          color: #6b7280;
        }

        .fc .fc-daygrid-day.fc-day-future .fc-daygrid-day-number {
          color: #374151;
        }

        /* Responsive: boutons et titres plus compacts sur mobile */
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            padding: 0.5rem 0.5rem 0.25rem 0.5rem;
          }
          .fc .fc-button {
            font-size: 0.6rem;
            padding: 0.25rem 0.5rem;
            min-width: 28px;
            min-height: 28px;
            border-radius: 0.5rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
          .fc .fc-col-header-cell-cushion {
            font-size: 0.65rem;
            padding: 0.25rem 0.25rem;
          }
          .fc .fc-timegrid-slot-label {
            font-size: 0.65rem;
            padding: 0.125rem 0.375rem;
          }
          .fc .fc-button .fc-icon {
            font-size: 0.8em;
          }
          .fc .fc-button-group .fc-button {
            margin: 0 0.15rem;
          }
          .fc .fc-button.fc-today-button {
            padding: 0.25rem 0.5rem;
          }
          .fc .fc-event .event-title,
          .fc .fc-event .event-time {
            font-size: 9px;
          }
        }

        @media (max-width: 1024px) and (min-width: 640px) {
          .fc .fc-toolbar {
            padding: 1rem 1.25rem 0.75rem 1.25rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
