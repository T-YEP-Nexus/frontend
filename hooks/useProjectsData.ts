import { useEffect, useState } from "react";
import { getUserIdFromToken } from "@/lib/auth";

interface Project {
  id: string;
  name: string;
  description: string;
  ressources: Array<{
    filename: string;
    url: string;
    description?: string;
    uploaded_at: string;
  }>;
  is_active: boolean;
  id_creator: string;
  created_at: string;
  updated_at: string;
}

interface ProjectStudent {
  id: string;
  id_student: string;
  id_project: string;
  due_date: string | null;
  assigned_at: string;
  advisor_comment: string | null;
  score: number | null;
  max_score: number | null;
  created_at: string;
  updated_at: string;
}

export function useProjectsData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const fetchActiveProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3003/projects/active/list");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des projets actifs");
      }

      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByStudent = async (studentId?: string) => {
    try {
      setLoading(true);
      const userId = studentId || getUserIdFromToken();

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`http://localhost:3003/project-students/student/${userId}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des projets de l'étudiant");
      }

      const result = await response.json();

      if (result.success) {
        // Récupérer les détails des projets pour chaque assignation
        const projectDetails = await Promise.all(
          result.data.map(async (assignment: ProjectStudent) => {
            const projectResponse = await fetch(`http://localhost:3003/projects/${assignment.id_project}`);
            if (projectResponse.ok) {
              const projectResult = await projectResponse.json();
              return {
                ...projectResult.data,
                assignment: assignment
              };
            }
            return null;
          })
        );

        setProjects(projectDetails.filter(Boolean));
      } else {
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectById = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3003/projects/${projectId}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du projet");
      }

      const result = await response.json();

      if (result.success) {
        setProjects([result.data]);
      } else {
        throw new Error(result.message || "Erreur lors du chargement du projet");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3003/projects");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de tous les projets");
      }

      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    fetchActiveProjects,
    fetchProjectsByStudent,
    fetchProjectById,
    fetchAllProjects
  };
}
