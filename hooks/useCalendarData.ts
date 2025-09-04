import { useEffect, useState, useCallback } from "react";
import { getUserIdFromToken } from "@/lib/auth";

interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  event_datetime: string;
  duration_minutes: number;
  description?: string;
  event_type: 'follow-up' | 'kick-off' | 'keynote' | 'hub-talk' | 'other';
  report?: string;
  id_creator: string;
  created_at: string;
  id_prom?: string | null;
  location?: string;
  slot_duration?: number;
  allow_multiple_users?: boolean;
  target_promotions?: string[];
  slots?: any[];
  registration_id?: number;
}

interface EventStudent {
  id: number;
  id_student: string;
  id_event: number;
  created_at: string;
}

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3002/events");
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements");
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des événements");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventsByStudent = useCallback(async (studentId?: string) => {
    try {
      setLoading(true);
      const userId = studentId || getUserIdFromToken();
      
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`http://localhost:3002/events/student/${userId}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements de l'étudiant");
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des événements");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventById = useCallback(async (eventId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'événement");
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents([result.data]);
      } else {
        throw new Error(result.message || "Erreur lors du chargement de l'événement");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventsByType = useCallback(async (eventType: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/events/type/${eventType}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements par type");
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents([result.data]);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des événements");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentAgenda = useCallback(async (studentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/agenda/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'agenda de l'étudiant");
      }
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement de l'agenda");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    try {
      const response = await fetch("http://localhost:3002/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de l'événement");
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la création de l'événement");
      }
      
      return result.data;
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la création");
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: number) => {
    try {
      const response = await fetch(`http://localhost:3002/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression de l'événement");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la suppression de l'événement");
      }
      
    } catch (err: any) {
      throw new Error(err.message || "Erreur inconnue lors de la suppression");
    }
  }, []);

  const updateEvent = useCallback(async (eventId: number, eventData: Partial<CalendarEvent & { event_datetime?: string }>) => {
    try {
      const dataToSend = { ...eventData };
      if (dataToSend.start) {
        dataToSend.event_datetime = new Date(dataToSend.start).toISOString();
        delete dataToSend.start;
      }

      const response = await fetch(`http://localhost:3002/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour de l'événement");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la mise à jour de l'événement");
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la mise à jour");
      throw err;
    }
  }, []);

  const registerToEvent = useCallback(async (eventId: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch("http://localhost:3002/event-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_student: userId,
          id_event: eventId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de l'inscription");
      }
      
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de l'inscription");
    }
  }, []);

  const registerToSlot = useCallback(async (eventId: number, slotIndex: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`http://localhost:3002/events/${eventId}/slots/${slotIndex}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_student: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription au créneau");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de l'inscription au créneau");
      }
      
      return result.data;
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de l'inscription au créneau");
    }
  }, []);

  const unregisterFromSlot = useCallback(async (eventId: number, slotIndex: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`http://localhost:3002/events/${eventId}/slots/${slotIndex}/unregister`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_student: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la désinscription du créneau");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la désinscription du créneau");
      }
      
      return result.data;
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de la désinscription du créneau");
    }
  }, []);

  const refreshEvents = useCallback(async (userId: string) => {
    try {
      if (events.length > 0 && events.some(event => event.registration_id)) {
        await fetchEventsByStudent(userId);
      } else {
        await fetchAllEvents();
      }
    } catch (error) {
      console.error("Erreur lors du rechargement des événements:", error);
      await fetchAllEvents();
    }
  }, [events, fetchEventsByStudent, fetchAllEvents]);

  const unregisterFromEvent = useCallback(async (eventId: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const assignmentsResponse = await fetch(`http://localhost:3002/event-students/student/${userId}`);
      if (!assignmentsResponse.ok) {
        throw new Error("Erreur lors de la récupération des inscriptions");
      }

      const assignmentsResult = await assignmentsResponse.json();
      const assignment = assignmentsResult.data?.find((a: any) => a.id_event === eventId);

      if (!assignment) {
        throw new Error("Inscription non trouvée");
      }

      const response = await fetch(`http://localhost:3002/event-students/${assignment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la désinscription");
      }

    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de la désinscription");
    }
  }, []);

  const checkUserRegistration = useCallback(async (eventId: number): Promise<boolean> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return false;

      const response = await fetch(`http://localhost:3002/event-students/student/${userId}`);
      if (!response.ok) return false;

      const result = await response.json();
      return result.data?.some((assignment: any) => assignment.id_event === eventId) || false;
    } catch (error) {
      return false;
    }
  }, []);

  return { 
    events, 
    loading, 
    error, 
    fetchAllEvents,
    fetchEventsByStudent,
    fetchEventById,
    fetchEventsByType,
    registerToEvent,
    registerToSlot,
    unregisterFromEvent,
    unregisterFromSlot,
    checkUserRegistration,
    fetchStudentAgenda,
    createEvent,
    deleteEvent,
    updateEvent,
  };
}

export type { CalendarEvent }; 