import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import ModalEventForm from "./ModalEventForm";
import ModalDeleteEvent from "./ModalDeleteEvent";
import ModalEventRegistration from "./ModalEventRegistration";
import { useCalendarData } from "@/hooks/useCalendarData";
import { getStudentData, getUserData } from "@/lib/userData";
import { getUserIdFromToken } from "@/lib/auth";

const Calendar: React.FC = () => {
  const { 
    events: backendEvents, 
    loading, 
    error, 
    registerToEvent, 
    unregisterFromEvent, 
    checkUserRegistration 
  } = useCalendarData();
  
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [permissions, setPermissions] = useState({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canRegisterToEvents: false,
    canUnregisterFromEvents: false,
  });
  const [roleLoading, setRoleLoading] = useState(true);
  const [events, setEvents] = useState<(EventInput & { id: string })[]>([]);

  // Charger le rôle utilisateur
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          setRoleLoading(false);
          return;
        }

        // Récupérer les données utilisateur via getStudentData
        const userData = await getStudentData(userId);
        // getStudentData retourne des données étudiant, pas le rôle
        // On utilise getUserData pour avoir le rôle complet
        const fullUserData = await getUserData(userId);
        const role = fullUserData.role || 'student';
        
        // Convertir le rôle en format attendu
        const userRole = role.toLowerCase() === 'admin' ? 'admin' : 'student';
        setUserRole(userRole);
        
        // Définir les permissions selon le rôle
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

  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{start: string, end: string} | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string; event_type?: string; description?: string } | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // Synchroniser les événements du backend avec le calendrier
  useEffect(() => {
    if (!loading && !error) {
      const calendarEvents = backendEvents.map((event) => ({
        id: String(event.id),
        title: event.title,
        start: new Date(event.event_datetime),
        end: new Date(new Date(event.event_datetime).getTime() + event.duration_minutes * 60000),
        color: getEventColor(event.event_type),
        extendedProps: {
          description: event.description,
          event_type: event.event_type,
          report: event.report,
          id_creator: event.id_creator
        }
      }));
      setEvents(calendarEvents);
    }
  }, [backendEvents, loading, error]);

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
    // Format pour input type="datetime-local"
    const toInput = (d: Date) => d.toISOString().slice(0, 16);
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

  // Ajout effectif de l'événement depuis la modale
  const handleModalSubmit = ({ title, start, end }: { title: string; start: string; end: string }) => {
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()), // Utiliser timestamp comme ID temporaire
        title,
        start,
        end,
        color: "#60a5fa",
      },
    ]);
    setModalOpen(false);
    setModalData(null);
  };

  // Clic sur un événement : gérer selon le rôle
  const handleEventClick = async (clickInfo: EventClickArg) => {
    const eventId = Number(clickInfo.event.id);
    const event = backendEvents.find(e => e.id === eventId);
    
    if (!event) return;

    if (isAdmin) {
      // Pour les admins : ouvrir la modale de suppression
      setEventToDelete({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start ?? undefined,
        end: clickInfo.event.end ?? undefined,
      });
      setDeleteModalOpen(true);
    } else if (isStudent) {
      // Pour les étudiants : ouvrir la modale d'inscription/désinscription
      const isRegistered = await checkUserRegistration(eventId);
      setIsUserRegistered(isRegistered);
      
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start ?? undefined,
        end: clickInfo.event.end ?? undefined,
        event_type: event.event_type,
        description: event.description
      });
      setShowRegistrationModal(true);
    }
  };

  // Confirmer la suppression
  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  // Gérer le déplacement d'un événement (drag & drop)
  const handleEventDrop = (dropInfo: any) => {
    if (!permissions.canEditEvents) return;
    setEvents((prev) => prev.map((e) =>
      e.id === dropInfo.event.id
        ? {
            ...e,
            start: dropInfo.event.start,
            end: dropInfo.event.end,
          }
        : e
    ));
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
      {/* Indicateur de rôle utilisateur */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Mode :</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isAdmin 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isAdmin ? 'Administrateur' : 'Étudiant'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {isAdmin ? 'CRUD complet' : 'Inscription uniquement'}
          </div>
        </div>
      </div>
      
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
      <ModalEventForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        defaultStart={modalData?.start}
        defaultEnd={modalData?.end}
      />
      <ModalDeleteEvent
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteEvent}
        event={eventToDelete}
      />
      <ModalEventRegistration
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        event={selectedEvent}
        isRegistered={isUserRegistered}
        onRegister={registerToEvent}
        onUnregister={unregisterFromEvent}
      />
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
        .fc .fc-button:hover, .fc .fc-button:focus {
          background: #1971FF;
          color: #fff;
        }
        .fc .fc-today-button {
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
        .fc .fc-today-button:hover, .fc .fc-today-button:focus {
          background: #1971FF;
          color: #fff;
        }
        .fc .fc-today-button:disabled {
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