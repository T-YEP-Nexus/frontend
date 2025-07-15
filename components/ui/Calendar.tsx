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
  const [events, setEvents] = useState<CalendarEventInput[]>([]);

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
  const [roleSelector, setRoleSelector] = useState<'admin' | 'student'>('admin');
  // Si la prop role est fournie, on l'utilise, sinon on prend le sélecteur ou la détection auto
  const effectiveRole = role || roleSelector || userRole;
  const isAdmin = effectiveRole === 'admin';
  const isStudent = effectiveRole === 'student';
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{start: string, end: string} | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string; slots?: { start: string; end: string; user: string | null }[] } | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string; event_type?: string; description?: string; slots?: { start: string; end: string; user: string | null }[] } | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // Synchroniser les événements du backend avec le calendrier
  useEffect(() => {
    if (!loading && !error) {
      let calendarEvents = backendEvents.map((event) => ({
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

  // Clic sur un événement : gérer selon le rôle
  const handleEventClick = async (clickInfo: EventClickArg) => {
    console.log("handleEventClick called", clickInfo);
    const eventId = clickInfo.event.id;
    if (isAdmin) {
      // On cherche l'événement complet pour récupérer les slots
      const event = events.find(e => String(e.id) === String(eventId));
      setEventToDelete({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start ?? undefined,
        end: clickInfo.event.end ?? undefined,
        slots: event && event.extendedProps && event.extendedProps.slots ? event.extendedProps.slots : [],
      });
      setDeleteModalOpen(true);
      return;
    }
    // Pour les étudiants, on cherche dans backendEvents
    // En mode test front, on cherche dans events (événements front + back)
    const event = events.find(e => String(e.id) === String(eventId));
    console.log("eventId", eventId, "event found", event);
    if (!event) {
      console.error("Aucun événement trouvé pour cet id", eventId);
      return;
    }
    if (isStudent) {
      const isRegistered = await checkUserRegistration(Number(eventId));
      setIsUserRegistered(isRegistered);
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start ?? undefined,
        end: clickInfo.event.end ?? undefined,
        event_type: event.event_type,
        description: event.description,
        slots: event.extendedProps && event.extendedProps.slots ? event.extendedProps.slots : [],
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
      {/* Sélecteur de rôle pour test front */}
      { !role && (
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Rôle de test :</label>
          <select
            className="border border-blue-300 rounded-xl px-3 py-1 text-base focus:outline-none focus:border-blue-500 bg-blue-50"
            value={roleSelector}
            onChange={e => setRoleSelector(e.target.value as 'admin' | 'student')}
          >
            <option value="admin">Administrateur</option>
            <option value="student">Étudiant</option>
          </select>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{isAdmin ? 'Administrateur' : 'Étudiant'}</span>
        </div>
      )}
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
      {permissions.canCreateEvents && (
        <ModalEventForm
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          defaultStart={modalData?.start}
          defaultEnd={modalData?.end}
        />
      )}
      {/* Modal admin : détail, créneaux/inscrits et suppression */}
      {isAdmin && eventToDelete && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${deleteModalOpen ? '' : 'hidden'}`} style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md sm:w-[700px] max-w-[98vw] shadow-lg relative overflow-x-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Détail de l'événement</h2>
              <button className="text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-xl p-1 transition-all duration-200 hover:bg-gray-200" onClick={() => setDeleteModalOpen(false)}>&times;</button>
            </div>
            <p className="mb-1">Titre : <span className="font-semibold">{eventToDelete.title}</span></p>
            <p className="mb-4 text-base text-gray-500">{eventToDelete.start && eventToDelete.end ? `${new Date(eventToDelete.start).toLocaleString()} - ${new Date(eventToDelete.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : null}</p>
            {/* Liste des créneaux/inscrits si slots présents */}
            {Array.isArray(eventToDelete.slots) && eventToDelete.slots.length > 0 && (
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 pr-1">
                {eventToDelete.slots.map((slot: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-blue-50 rounded-xl px-5 py-2">
                    <span className="flex-1 text-sm">
                      {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {slot.user ? (
                      <span className="text-xs text-blue-700 font-semibold">{slot.user}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Libre</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              className="mt-2 px-5 py-2 bg-red-400 text-white rounded-xl font-semibold shadow-sm hover:bg-red-500 hover:shadow-lg transition-all duration-200 self-end text-lg"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) handleDeleteEvent();
              }}
            >
              Supprimer l'événement
            </button>
          </div>
        </div>
      )}
      {/* Retirer la modal de suppression séparée */}
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