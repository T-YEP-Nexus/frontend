import { useEffect, useState } from "react";
import { getUserIdFromToken } from "@/lib/auth";

interface Event {
  id: number;
  title: string;
  event_datetime: string;
  duration_minutes: number;
  description?: string;
  event_type: 'follow-up' | 'kick-off' | 'keynote' | 'hub-talk' | 'other';
  report?: string;
  id_creator: string;
  created_at: string;
}

interface EventStudent {
  id: number;
  id_student: string;
  id_event: number;
  created_at: string;
}

export function useCalendarData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3009/events");
      
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
  };

  const fetchEventsByStudent = async (studentId?: string) => {
    try {
      setLoading(true);
      const userId = studentId || getUserIdFromToken();
      
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`http://localhost:3009/event-students/student/${userId}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements de l'étudiant");
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Récupérer les détails des événements pour chaque assignation
        const eventDetails = await Promise.all(
          result.data.map(async (assignment: EventStudent) => {
            const eventResponse = await fetch(`http://localhost:3009/events/${assignment.id_event}`);
            if (eventResponse.ok) {
              const eventResult = await eventResponse.json();
              return {
                ...eventResult.data,
                assignment: assignment
              };
            }
            return null;
          })
        );
        
        setEvents(eventDetails.filter(Boolean));
      } else {
        throw new Error(result.message || "Erreur lors du chargement des événements");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventById = async (eventId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3009/events/${eventId}`);
      
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
  };

  const fetchEventsByType = async (eventType: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3009/events/type/${eventType}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements par type");
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents([result.data]); // Un seul événement par type selon l'API
      } else {
        throw new Error(result.message || "Erreur lors du chargement des événements");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // S'inscrire à un événement
  const registerToEvent = async (eventId: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch("http://localhost:3009/event-students", {
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

      // Recharger les événements pour mettre à jour l'état
      await fetchAllEvents();
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de l'inscription");
    }
  };

  // Se désinscrire d'un événement
  const unregisterFromEvent = async (eventId: number) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      // D'abord, récupérer l'ID de l'inscription
      const assignmentsResponse = await fetch(`http://localhost:3009/event-students/student/${userId}`);
      if (!assignmentsResponse.ok) {
        throw new Error("Erreur lors de la récupération des inscriptions");
      }

      const assignmentsResult = await assignmentsResponse.json();
      const assignment = assignmentsResult.data?.find((a: any) => a.id_event === eventId);

      if (!assignment) {
        throw new Error("Inscription non trouvée");
      }

      // Supprimer l'inscription
      const response = await fetch(`http://localhost:3009/event-students/${assignment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la désinscription");
      }

      // Recharger les événements pour mettre à jour l'état
      await fetchAllEvents();
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de la désinscription");
    }
  };

  // Vérifier si l'utilisateur est inscrit à un événement
  const checkUserRegistration = async (eventId: number): Promise<boolean> => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return false;

      const response = await fetch(`http://localhost:3009/event-students/student/${userId}`);
      if (!response.ok) return false;

      const result = await response.json();
      return result.data?.some((assignment: any) => assignment.id_event === eventId) || false;
    } catch (error) {
      return false;
    }
  };

  return { 
    events, 
    loading, 
    error, 
    fetchAllEvents,
    fetchEventsByStudent,
    fetchEventById,
    fetchEventsByType,
    registerToEvent,
    unregisterFromEvent,
    checkUserRegistration
  };
} 