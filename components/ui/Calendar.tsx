"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventInput, DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
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
    fetchEventsByStudent,
    fetchStudentAgenda,
    updateEvent,
    createEvent,
    deleteEvent,
    registerToEvent, 
    registerToSlot,
    unregisterFromEvent, 
    unregisterFromSlot,
    checkUserRegistration 
  } = useCalendarData();

  const { promotions, loading: promotionsLoading, error: promotionsError } = usePromotionsData();

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
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string; slots?: any[] } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ 
    id: string; 
    title: string; 
    start?: Date | string; 
    end?: Date | string; 
    event_type?: string; 
    description?: string;
    location?: string;
    slots?: any[];
    target_promotions?: string[];
    allow_multiple_users?: boolean;
    slot_duration?: number;
  } | null>(null);
  const [eventDetails, setEventDetails] = useState<any | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const effectiveRole = role || userRole;
  const isAdmin = effectiveRole === "admin" || effectiveRole === "advisor";
  const isStudent = effectiveRole === "student";
  
  // Fonction de rafraîchissement unifiée
  const refreshCalendarData = useCallback(() => {
    const userId = getUserIdFromToken();
    if (isAdmin) {
      fetchAllEvents();
    } else if (isStudent && userId) {
      fetchEventsByStudent(userId);
    }
  }, [isAdmin, isStudent, fetchAllEvents, fetchEventsByStudent]);

  // Charger le rôle utilisateur, les permissions et les données initiales
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

      // Définir les permissions et charger les données
      if (finalRole === "admin" || finalRole === "advisor") {
        setPermissions({
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canRegisterToEvents: true, // Les admins peuvent tout faire
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
  }, [role]); // Dépendance simplifiée

  // Protection supplémentaire : empêcher les étudiants d'utiliser les filtres de promotion
  useEffect(() => {
    if (effectiveRole === "student" && selectedPromotions.length > 0) {
      console.log("Protection : réinitialisation des filtres de promotion pour l'étudiant");
      setSelectedPromotions([]);
    }
  }, [effectiveRole, selectedPromotions]);

  // Synchroniser et filtrer les événements
  useEffect(() => {
    if (!loading && !error && backendEvents) {
      let calendarEvents = backendEvents.map((event: CalendarEvent) => {
        const typedEvent = event as CalendarEvent;
        // Validation des données avant de créer l'objet événement
        if (!typedEvent.id || !typedEvent.title || !typedEvent.event_datetime || !typedEvent.duration_minutes) {
          console.warn('Événement invalide ou incomplet détecté:', typedEvent);
          return null;
        }

        // Utiliser event_datetime et duration_minutes comme source de vérité
        let start = new Date(typedEvent.event_datetime);
        let end = new Date(start.getTime() + typedEvent.duration_minutes * 60000);

        // Validation des dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('Dates invalides pour l\'événement:', typedEvent.id, { start, end });
          return null;
        }

        // Pour les étudiants, si ils sont inscrits à un slot, on rétrécit l'affichage
        if (isStudent && typedEvent.slots && Array.isArray(typedEvent.slots)) {
          const userId = getUserIdFromToken();
          const mySlot = typedEvent.slots.find((slot: any) => slot.user === userId);
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
          description: typedEvent.description || '',
          event_type: typedEvent.event_type || 'other',
          location: typedEvent.location || '',
          report: typedEvent.report || '',
          id_creator: typedEvent.id_creator || '',
          target_promotions: Array.isArray(typedEvent.target_promotions) ? typedEvent.target_promotions : [],
          slots: Array.isArray(typedEvent.slots) ? typedEvent.slots : [],
          created_at: typedEvent.created_at || '',
          registration_id: typedEvent.registration_id,
        };
      }).filter(event => event !== null); // Filtrer les événements null
      
      // Appliquer les filtres supplémentaires
      let filteredEvents = calendarEvents;
      
      // Filtre par type d'événement
      if (selectedEventTypes.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          event.event_type && selectedEventTypes.includes(event.event_type)
        );
      }
      
      // Filtre par promotion - uniquement pour admins/advisors
      if (selectedPromotions.length > 0 && (effectiveRole === "admin" || effectiveRole === "advisor")) {
        filteredEvents = filteredEvents.filter(event => 
          event.target_promotions && 
          event.target_promotions.some((promo: string) => selectedPromotions.includes(promo))
        );
      }
      
      // Filtre personnel
      if (showOnlyMyEvents) {
        const userId = getUserIdFromToken();
        filteredEvents = filteredEvents.filter(event => 
          event.slots && 
          event.slots.some((slot: any) => slot.user === userId)
        );
      }
      
      setEvents(filteredEvents);
    }
  }, [backendEvents, loading, error, isStudent, selectedEventTypes, selectedPromotions, showOnlyMyEvents]);

  // DEBUG : log des événements quand ils changent
  useEffect(() => {
    console.log("🎯 FullCalendar va recevoir ces événements:", events);
    console.log("🎯 Nombre d'événements:", events.length);
    if (events.length > 0) {
      console.log("🎯 Premier événement:", events[0]);
    }
  }, [events]);

  // Fonction pour obtenir la couleur selon le type d'événement
  const getEventColor = (eventType: string) => {
    if (!eventType || typeof eventType !== 'string') {
      return "#6b7280"; // gris par défaut
    }
    
    switch (eventType) {
      case "follow-up":
        return "#4ade80"; // vert
      case "kick-off":
        return "#f59e0b"; // orange
      case "keynote":
        return "#8b5cf6"; // violet
      case "hub-talk":
        return "#06b6d4"; // cyan
      case "other":
        return "#60a5fa"; // bleu
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
  const handleModalSubmit = async ({
    title,
    start,
    end,
    slot_duration, // Correction ici
  }: {
    title: string;
    start: string;
    end: string;
    slot_duration: number; // Et ici
  }) => {
    // Générer les créneaux selon la durée choisie
    const slots: { start: string; end: string; user: string | null }[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let current = new Date(startDate);
    while (current < endDate) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + slot_duration * 60000);
      if (slotEnd > endDate) break;
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        user: null,
      });
      current = slotEnd;
    }
    await createEvent({
      title,
      start,
      end,
      slot_duration, // Et ici
      slots,
    } as Omit<CalendarEvent, 'id' | 'created_at'>);
    refreshCalendarData(); // Rafraîchir les données
    setModalOpen(false);
    setModalData(null);
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const eventId = Number(clickInfo.event.id);
    const event = backendEvents.find(e => e.id === eventId);

    if (!event) {
      console.error("Aucun événement trouvé pour cet id", eventId);
      return;
    }

    // Préparer les données de l'événement pour la modal
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
      // Ajout des champs manquants pour la complétude
      allow_multiple_users: event.allow_multiple_users,
      slot_duration: event.slot_duration
    };

    if (isAdmin) {
      // Les admins et advisors peuvent choisir entre voir les détails ou éditer
      setEventDetails(eventData);
      setShowEventDetailsModal(true);
    } else if (isStudent) {
      // Les étudiants voient d'abord les détails, puis peuvent s'inscrire
      const isRegistered = await checkUserRegistration(eventId);
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        event_type: event.event_type,
        description: event.description,
        location: event.location,
        slots: event.slots || [],
        target_promotions: event.target_promotions,
        allow_multiple_users: event.allow_multiple_users,
        slot_duration: event.slot_duration,
      });
      setIsUserRegistered(isRegistered);
      setShowRegistrationModal(true);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      await deleteEvent(eventId);
      refreshCalendarData();
      setShowEventDetailsModal(false);
      setDeleteModalOpen(false); // Fermer aussi la modale de suppression si ouverte
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
  
  // Gérer le déplacement d'un événement (drag & drop)
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
      await updateEvent(eventId, { start: newStartDate.toISOString() } as Partial<CalendarEvent>);
      refreshCalendarData(); // Rafraîchir pour être sûr que tout est à jour
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'événement:", error.message);
      alert("La mise à jour de l'événement a échoué.");
      dropInfo.revert();
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
      <div className="bg-white rounded-lg shadow p-2 relative">
        <div className="flex items-center justify-center h-[500px]">
          <AdminLoading message="Chargement des événements..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-2 relative">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Erreur de chargement</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-2 relative">
      {/* Statistiques du calendrier */}
      <CalendarStats
        totalEvents={events.length}
        eventsByType={events.reduce((acc, event) => {
          const type = event.event_type || 'other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)}
        upcomingEvents={events.filter(event => 
          event.start && new Date(event.start) > new Date()
        ).length}
        myEvents={events.filter(event => 
          event.slots && event.slots.some((slot: any) => slot.user === getUserIdFromToken())
        ).length}
        totalSlots={events.reduce((total, event) => 
          total + (event.slots?.length || 0), 0
        )}
        availableSlots={events.reduce((total, event) => 
          total + (event.slots?.filter((slot: any) => !slot.user).length || 0), 0
        )}
      />

      {/* Filtres du calendrier */}
      <CalendarFilters
        eventTypes={["follow-up", "kick-off", "keynote", "hub-talk", "other"]}
        selectedEventTypes={selectedEventTypes}
        onEventTypesChange={setSelectedEventTypes}
        promotions={promotions || []}
        selectedPromotions={selectedPromotions}
        onPromotionsChange={(promotions) => {
          // Seuls les admins/advisors peuvent changer les filtres de promotion
          if (effectiveRole === "admin" || effectiveRole === "advisor") {
            setSelectedPromotions(promotions);
          } else {
            // Protection : les étudiants ne peuvent pas changer les filtres de promotion
            console.log("Protection : les étudiants ne peuvent pas filtrer par promotion");
            setSelectedPromotions([]);
          }
        }}
        showOnlyMyEvents={showOnlyMyEvents}
        onShowOnlyMyEventsChange={setShowOnlyMyEvents}
        onClearFilters={() => {
          setSelectedEventTypes([]);
          // Les étudiants ne peuvent pas avoir de filtres de promotion
          if (effectiveRole === "admin" || effectiveRole === "advisor") {
            setSelectedPromotions([]);
          }
          setShowOnlyMyEvents(false);
        }}
        userRole={effectiveRole || undefined}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        headerToolbar={{ left: "prev today", center: "title", right: "next" }}
        customButtons={{}}
        height={700}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
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
          createEvent={async (data) => { await createEvent(data); refreshCalendarData(); }}
          updateEvent={async (id, data) => { await updateEvent(id, data); refreshCalendarData(); }}
          deleteEvent={handleDeleteEvent}
        />
      )}

      {/* Modal de détails des événements */}
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
      {/* Modal admin : détail, créneaux/inscrits et suppression */}
      {isAdmin && eventToDelete && (
        <ModalDeleteEvent
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          event={eventToDelete}
          onConfirm={() => handleDeleteEvent(Number(eventToDelete.id))}
        />
      )}
      {isStudent && selectedEvent && (
        <>
          <ModalEventRegistration
            open={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            event={selectedEvent}
            isRegistered={isUserRegistered}
            onRegister={async (eventId) => { await registerToEvent(eventId); refreshCalendarData(); }}
            onRegisterSlot={handleRegisterSlot}
            onUnregister={async (eventId) => { await unregisterFromEvent(eventId); refreshCalendarData(); }}
            onUnregisterSlot={handleUnregisterSlot}
          />

          {eventToDelete && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center ${
                deleteModalOpen ? "" : "hidden"
              }`}
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-[98vw] sm:w-[700px] shadow-lg relative overflow-x-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Détail de l'événement</h2>
                  <button
                    className="text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <p className="mb-1">
                  Titre :{" "}
                  <span className="font-semibold">{eventToDelete.title}</span>
                </p>
                <p className="mb-4 text-base text-gray-500">
                  {eventToDelete.start && eventToDelete.end
                    ? `${new Date(
                        eventToDelete.start
                      ).toLocaleString()} - ${new Date(
                        eventToDelete.end
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : null}
                </p>
                {/* Liste des créneaux/inscrits si slots présents */}
                {Array.isArray(eventToDelete.slots) &&
                  eventToDelete.slots.length > 0 && (
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 pr-1">
                      {eventToDelete.slots.map((slot: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-blue-50 rounded-xl px-5 py-2"
                        >
                          <span className="flex-1 text-sm">
                            {new Date(slot.start).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(slot.end).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {slot.user ? (
                            <span className="text-xs text-blue-700 font-semibold">
                              {slot.user}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Libre</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                <button
                  className="mt-2 px-5 py-2 bg-red-400 text-white rounded-xl font-semibold shadow-sm hover:bg-red-500 hover:shadow-lg transition-all duration-200 self-end text-lg"
                  onClick={() => handleDeleteEvent(Number(eventToDelete.id))}
                >
                  Supprimer l'événement
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Style personnalisé FullCalendar */}
      <style jsx global>{`
        .fc .fc-toolbar {
          margin-bottom: 0.5rem;
        }
        .fc .fc-toolbar-chunk {
          display: flex;
          align-items: center;
        }
        .fc .fc-toolbar-chunk:first-child {
          min-width: 180px;
        }
        .fc .fc-toolbar-chunk:last-child {
          min-width: 180px;
          justify-content: flex-end;
        }
        .fc .fc-toolbar-center {
          justify-content: center;
          gap: 1.5rem;
        }
        .fc .fc-button {
          background: #e6f0ff;
          color: #1971ff;
          border: none;
          border-radius: 9999px;
          font-size: 1rem;
          padding: 0.25rem 0.75rem;
          margin: 0 0.25rem;
          min-width: 32px;
          min-height: 32px;
          transition: background 0.2s, color 0.2s;
        }
        .fc .fc-button:hover {
          background: #1971ff;
          color: #fff;
        }
        .fc .fc-button:focus {
          outline: none;
          box-shadow: none;
          background: #e6f0ff;
          color: #1971ff;
        }
        .fc .fc-button:active {
          background: #1971ff;
          color: #fff;
        }
        .fc .fc-button.fc-today-button {
          margin-right: 1.5rem;
          margin-left: 0.5rem;
          background: #e6f0ff;
          color: #1971ff;
          border-radius: 9999px;
          font-size: 1rem;
          padding: 0.25rem 2.2rem;
          min-width: 100px;
          min-height: 32px;
          font-weight: 600;
          box-shadow: 0 1px 4px #1971ff22;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .fc .fc-button.fc-today-button:hover {
          background: #1971ff;
          color: #fff;
        }
        .fc .fc-button.fc-today-button:focus {
          outline: none;
          box-shadow: none;
          background: #e6f0ff;
          color: #1971ff;
        }
        .fc .fc-button.fc-today-button:disabled {
          background: #e6f0ff !important;
          color: #1971ff !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1971ff;
          text-align: center;
          width: 100%;
        }
        .fc .fc-col-header-cell-cushion {
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
        }
        /* Cacher la scrollbar de l'en-tête des dates */
        .fc .fc-scroller-harness .fc-scroller {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .fc .fc-scroller-harness .fc-scroller::-webkit-scrollbar {
          display: none;
        }
        /* Scrollbar du calendrier : invisible par défaut, visible au hover */
        .fc .fc-timegrid-body {
          scrollbar-width: thin;
        }
        .fc .fc-timegrid-body::-webkit-scrollbar {
          width: 8px;
          background: transparent;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .fc .fc-timegrid-body:hover::-webkit-scrollbar {
          opacity: 1;
          background: #e6f0ff;
        }
        .fc .fc-timegrid-body::-webkit-scrollbar-thumb {
          background: #b3cfff;
          border-radius: 8px;
        }
        .fc .fc-timegrid-body::-webkit-scrollbar-thumb:hover {
          background: #1971ff;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
