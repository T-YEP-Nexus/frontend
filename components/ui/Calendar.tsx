"use client";

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventInput, DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import ModalEventForm from "./ModalEventForm";
import ModalDeleteEvent from "./ModalDeleteEvent";
import ModalEventRegistration from "./ModalEventRegistration";
import { useCalendarData } from "@/hooks/useCalendarData";
import { getUserData } from "@/lib/userData";
import { getUserIdFromToken } from "@/lib/auth";

// Ajout de la prop role
interface CalendarProps {
  role?: 'admin' | 'student';
}

type CalendarEventInput = EventInput & { id: string; extendedProps: { slots?: { start: string; end: string; user: string | null }[]; [key: string]: any } };

const Calendar: React.FC<CalendarProps> = ({ role }) => {
  const { 
    events: backendEvents, 
    loading, 
    error,
    fetchAllEvents,
    fetchStudentAgenda,
    updateEvent, 
    registerToEvent, 
    unregisterFromEvent, 
    checkUserRegistration 
  } = useCalendarData();
  
  const [userRole, setUserRole] = useState<'admin' | 'advisor' | 'student' | null>(null);
  const [permissions, setPermissions] = useState({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canRegisterToEvents: false,
    canUnregisterFromEvents: false,
  });
  const [roleLoading, setRoleLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  // Charger le rôle utilisateur
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          setRoleLoading(false);
          return;
        }

        // On n'a besoin que de getUserData, qui gère déjà l'agrégation des données
        const fullUserData = await getUserData(userId);
        const role = fullUserData.role || 'student';
        
        // Convertir le rôle en format attendu
        const userRole = ['admin', 'advisor'].includes(role.toLowerCase()) ? (role.toLowerCase() as 'admin' | 'advisor') : 'student';
        setUserRole(userRole);
        
        // Définir les permissions selon le rôle
        if (role === 'admin' || role === 'advisor') {
          setPermissions({
            canCreateEvents: true,
            canEditEvents: true,
            canDeleteEvents: true,
            canRegisterToEvents: true,
            canUnregisterFromEvents: true,
          });
        } else {
          setPermissions({
            canCreateEvents: false,
            canEditEvents: false,
            canDeleteEvents: false,
            canRegisterToEvents: true,
            canUnregisterFromEvents: true,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du rôle:', error);
        // Par défaut, considérer comme étudiant
        setUserRole('student');
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
      } finally {
        setRoleLoading(false);
      }
    };

    loadUserRole();
  }, []);

  // Charger les données du calendrier en fonction du rôle
  useEffect(() => {
    if (!roleLoading && userRole) {
      const userId = getUserIdFromToken();
      if (userRole === 'student' && userId) {
        fetchStudentAgenda(userId);
      } else if (userRole !== 'student') {
        fetchAllEvents();
      }
    }
  }, [userRole, roleLoading, fetchStudentAgenda, fetchAllEvents]);

  // On adapte les permissions si la prop role est fournie
  useEffect(() => {
    if (role) {
      setUserRole(role);
      if (role === 'admin') {
        setPermissions({
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
      } else {
        setPermissions({
          canCreateEvents: false, // Toujours false pour student
          canEditEvents: false,
          canDeleteEvents: false,
          canRegisterToEvents: true,
          canUnregisterFromEvents: true,
        });
      }
      setRoleLoading(false);
    }
  }, [role]);

  // DEBUG : log du rôle et des permissions
  console.log("userRole", userRole, "permissions", permissions);
  // Forçage temporaire pour test admin
  // Sélecteur de rôle pour test front
  const [roleSelector, setRoleSelector] = useState<'admin' | 'advisor' | 'student'>('admin');
  // Si la prop role est fournie, on l'utilise, sinon on prend le sélecteur ou la détection auto
  const effectiveRole = role || roleSelector || userRole;
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'advisor';
  const isStudent = effectiveRole === 'student';
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{start: string, end: string} | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string; event_type?: string; description?: string } | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // Synchroniser les événements du backend avec le calendrier
  useEffect(() => {
    if (!loading && !error) {
      let calendarEvents = backendEvents.map((event: any) => {
        // Par défaut, on affiche l'événement sur toute la plage
        let start = new Date(event.event_datetime);
        let end = new Date(new Date(event.event_datetime).getTime() + event.duration_minutes * 60000);
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
      case 'follow-up':
        return '#4ade80'; // vert
      case 'kick-off':
        return '#f59e0b'; // orange
      case 'keynote':
        return '#8b5cf6'; // violet
      case 'hub-talk':
        return '#06b6d4'; // cyan
      case 'other':
        return '#60a5fa'; // bleu
      default:
        return '#6b7280'; // gris
    }
  };

  // Ouvre la modale pour créer un événement
  const openModal = (start: Date, end: Date) => {
    // Format pour input type="datetime-local" en heure locale
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const handleModalSubmit = ({ title, start, end, slotDuration }: { title: string; start: string; end: string; slotDuration: number }) => {
    // Générer les créneaux selon la durée choisie
    const slots: { start: string; end: string; user: string | null }[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let current = new Date(startDate);
    while (current < endDate) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);
      if (slotEnd > endDate) break;
      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString(), user: null });
      current = slotEnd;
    }
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title,
        start,
        end,
        color: "#60a5fa",
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
    const event = backendEvents.find(e => e.id === eventId);

    if (!event) {
      console.error("Aucun événement trouvé pour cet id", eventId);
      return;
    }

    if (isAdmin) {
      setEventToEdit(event);
      setModalOpen(true);
      return;
    }
    
    if (isStudent) {
      const isRegistered = await checkUserRegistration(Number(eventId));
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        event_type: event.event_type,
        description: event.description,
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
    const formattedStartDate = isoDateString.replace('T', ' ').substring(0, 19) + "+00";

    try {
      await updateEvent(eventId, { event_datetime: formattedStartDate });
      // Pas besoin de re-fetch, car FullCalendar met déjà à jour l'UI.
      // fetchAllEvents() pourrait être appelé si vous voulez rafraîchir toutes les données.
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'événement:", error.message);
      alert("La mise à jour de l'événement a échoué. L'événement va être replacé à sa position d'origine.");
      dropInfo.revert(); // Annuler le changement visuel en cas d'erreur
    }
  };

  // Afficher un message de chargement ou d'erreur
  if (loading || roleLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-2 relative">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des événements...</p>
          </div>
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
      
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        headerToolbar={{ left: 'prev today', center: 'title', right: 'next' }}
        customButtons={{}}
        height={500}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        events={events}
        nowIndicator={true}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
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
        <ModalEventRegistration
          open={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          event={selectedEvent}
          isRegistered={isUserRegistered}
          onRegister={registerToEvent}
          onUnregister={unregisterFromEvent}
        />
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
          color: #1971FF;
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
          background: #1971FF;
          color: #fff;
        }
        .fc .fc-button:focus {
          outline: none;
          box-shadow: none;
          background: #e6f0ff;
          color: #1971FF;
        }
        .fc .fc-button:active {
          background: #1971FF;
          color: #fff;
        }
        .fc .fc-button.fc-today-button {
          margin-right: 1.5rem;
          margin-left: 0.5rem;
          background: #e6f0ff;
          color: #1971FF;
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
          background: #1971FF;
          color: #fff;
        }
        .fc .fc-button.fc-today-button:focus {
          outline: none;
          box-shadow: none;
          background: #e6f0ff;
          color: #1971FF;
        }
        .fc .fc-button.fc-today-button:disabled {
          background: #e6f0ff !important;
          color: #1971FF !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1971FF;
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
          background: #1971FF;
        }
      `}</style>
    </div>
  );
};

export default Calendar; 