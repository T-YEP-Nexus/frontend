import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import ModalEventForm from "./ModalEventForm";
import ModalDeleteEvent from "./ModalDeleteEvent";

let eventId = 0;

const initialEvents: (EventInput & { id: string })[] = [
  {
    id: String(eventId++),
    title: "Rendez-vous pédagogique",
    start: new Date().setHours(10, 0, 0, 0),
    end: new Date().setHours(11, 0, 0, 0),
    color: "#4ade80", // vert
  },
  {
    id: String(eventId++),
    title: "Projet à rendre",
    start: new Date().setHours(14, 0, 0, 0),
    end: new Date().setHours(15, 0, 0, 0),
    color: "#818cf8", // violet
  },
];

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<(EventInput & { id: string })[]>(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{start: string, end: string} | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; start?: Date | string; end?: Date | string } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Ouvre la modale pour créer un événement
  const openModal = (start: Date, end: Date) => {
    // Format pour input type="datetime-local"
    const toInput = (d: Date) => d.toISOString().slice(0, 16);
    setModalData({ start: toInput(start), end: toInput(end) });
    setModalOpen(true);
  };

  // Ajout d'un événement par sélection de plage horaire
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    openModal(selectInfo.start, selectInfo.end ?? selectInfo.start);
  };

  // Ajout d'un événement par simple clic
  const handleDateClick = (clickInfo: DateClickArg) => {
    const start = clickInfo.date;
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    openModal(start, end);
  };

  // Ajout effectif de l'événement depuis la modale
  const handleModalSubmit = ({ title, start, end }: { title: string; start: string; end: string }) => {
    setEvents((prev) => [
      ...prev,
      {
        id: String(eventId++),
        title,
        start,
        end,
        color: "#60a5fa",
      },
    ]);
    setModalOpen(false);
    setModalData(null);
  };

  // Clic sur un événement : ouvrir la modale de suppression
  const handleEventClick = (clickInfo: EventClickArg) => {
    setEventToDelete({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start ?? undefined,
      end: clickInfo.event.end ?? undefined,
    });
    setDeleteModalOpen(true);
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
        selectable={true}
        editable={true}
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