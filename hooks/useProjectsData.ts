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

interface ProjectCreationData {
  name: string;
  description: string;
  id_promotion: string;
  ressources?: Array<{
    filename: string;
    url: string;
    description?: string;
  }>;
  due_date?: string;
}

export function useProjectsData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  
  // États pour la création de projets
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<any>(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    
    // Vous devrez passer l'id_promotion ici
    // fetchProjectsByPromotion(promotionId);
  }, []);

  // Nouvelle fonction pour récupérer le profil par user ID
  const getProfileByUserId = async (userId: string) => {
    console.log("🔍 DEBUG - Récupération profil pour user:", userId);
    const response = await fetch(`http://localhost:3004/profile/user/${userId}`);
    
    console.log("🔍 DEBUG - Réponse API profil:", response.status, response.ok);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du profil");
    }

    const result = await response.json();
    console.log("🔍 DEBUG - Données profil reçues:", result);
    
    if (!result.success) {
      throw new Error(result.message || "Profil non trouvé");
    }

    return result.data;
  };

  // Nouvelle fonction pour récupérer l'étudiant par profile ID
  const getStudentByProfileId = async (profileId: string) => {
    console.log("🔍 DEBUG - Récupération étudiant pour profil:", profileId);
    const response = await fetch(`http://localhost:3003/student/profile/${profileId}`);
    
    console.log("🔍 DEBUG - Réponse API étudiant:", response.status, response.ok);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de l'étudiant");
    }

    const result = await response.json();
    console.log("🔍 DEBUG - Données étudiant reçues:", result);
    
    if (!result.success) {
      throw new Error(result.message || "Étudiant non trouvé");
    }

    return result.data;
  };

  // Nouvelle fonction pour récupérer la promotion par student ID
  const getPromotionIdByStudent = async (studentId: string) => {
    const response = await fetch(`http://localhost:3004/student/${studentId}`);
    
    console.log("🔍 DEBUG - Réponse API promotion par étudiant:", response.status, response.ok);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la promotion");
    }

    const result = await response.json();
    console.log("🔍 DEBUG - Données promotion par étudiant reçues:", result);
    
    if (!result.success) {
      throw new Error(result.message || "Promotion non trouvée");
    }

    return result.data;
  };

  // Fonction pour créer un projet et l'assigner automatiquement à tous les étudiants de la promotion
  const createProjectAndAssignToStudents = async (projectData: ProjectCreationData) => {
    try {
      console.log("🔍 DEBUG - Début création projet et assignation:", projectData);

      // Étape 1: Créer le projet
      console.log("🔍 DEBUG - Étape 1: Création du projet");
      const projectResponse = await fetch("http://localhost:3003/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!projectResponse.ok) {
        throw new Error("Erreur lors de la création du projet");
      }

      const projectResult = await projectResponse.json();
      console.log("🔍 DEBUG - Projet créé:", projectResult);

      if (!projectResult.success) {
        throw new Error(projectResult.message || "Échec de la création du projet");
      }

      const createdProject = projectResult.data;
      const projectId = createdProject.id;

      console.log("🔍 DEBUG - ID du projet créé:", projectId);

      // Étape 2: Récupérer tous les étudiants de la promotion
      console.log("🔍 DEBUG - Étape 2: Récupération des étudiants de la promotion");
      const studentsResponse = await fetch(`http://localhost:3004/students/promotion/${projectData.id_promotion}`);

      if (!studentsResponse.ok) {
        throw new Error("Erreur lors de la récupération des étudiants de la promotion");
      }

      const studentsResult = await studentsResponse.json();
      console.log("🔍 DEBUG - Étudiants récupérés:", studentsResult);

      if (!studentsResult.success) {
        throw new Error(studentsResult.message || "Aucun étudiant trouvé pour cette promotion");
      }

      const students = studentsResult.data;
      console.log("🔍 DEBUG - Nombre d'étudiants à assigner:", students.length);

      // Étape 3: Créer un project_student pour chaque étudiant
      console.log("🔍 DEBUG - Étape 3: Création des assignations project_student");
      const assignmentPromises = students.map(async (student: any, index: number) => {
        console.log(`🔍 DEBUG - Assignation ${index + 1}/${students.length} - Étudiant ID:`, student.id);
        
        const assignmentData = {
          id_student: student.id,
          id_project: projectId,
          due_date: projectData.due_date || null,
          advisor_comment: null,
          score: null,
          max_score: null
        };

        console.log(`🔍 DEBUG - Données assignation pour étudiant ${student.id}:`, assignmentData);

        const assignmentResponse = await fetch("http://localhost:3003/project-students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assignmentData),
        });

        if (!assignmentResponse.ok) {
          console.error(`❌ DEBUG - Erreur assignation étudiant ${student.id}:`, assignmentResponse.status);
          throw new Error(`Erreur lors de l'assignation pour l'étudiant ${student.id}`);
        }

        const assignmentResult = await assignmentResponse.json();
        console.log(`🔍 DEBUG - Assignation créée pour étudiant ${student.id}:`, assignmentResult);

        if (!assignmentResult.success) {
          throw new Error(`Échec assignation étudiant ${student.id}: ${assignmentResult.message}`);
        }

        return assignmentResult.data;
      });

      // Attendre que toutes les assignations soient créées
      const assignments = await Promise.all(assignmentPromises);
      console.log("🔍 DEBUG - Toutes les assignations créées:", assignments);

      // Retourner le résultat complet
      const result = {
        success: true,
        message: `Projet créé et assigné à ${students.length} étudiant(s)`,
        data: {
          project: createdProject,
          assignments: assignments,
          studentsCount: students.length
        }
      };

      console.log("🔍 DEBUG - Résultat final:", result);
      return result;

    } catch (error: any) {
      console.error("❌ DEBUG - Erreur dans createProjectAndAssignToStudents:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la création et assignation du projet",
        data: null
      };
    }
  };

  // Fonction wrapper pour la création avec gestion d'état
  const createAndAssignProject = async (projectData: ProjectCreationData) => {
    try {
      setCreating(true);
      setCreationError(null);
      setCreationResult(null);

      const result = await createProjectAndAssignToStudents(projectData);
      
      if (result.success) {
        setCreationResult(result);
        return result;
      } else {
        setCreationError(result.message);
        return result;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Erreur inconnue";
      setCreationError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: null
      };
    } finally {
      setCreating(false);
    }
  };

  // Réinitialiser l'état de création
  const resetCreationState = () => {
    setCreating(false);
    setCreationError(null);
    setCreationResult(null);
  };

  // Nouvelle fonction principale pour récupérer les projets de la promotion de l'étudiant connecté
  const fetchProjectsForCurrentStudent = async () => {
    try {
      console.log("🔍 DEBUG - Début fetchProjectsForCurrentStudent");
      setLoading(true);
      setError(null);
      
      const userId = getUserIdFromToken();
      console.log("🔍 DEBUG - User ID:", userId);

      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }

      // Étape 1: Récupérer le profil
      const profile = await getProfileByUserId(userId);
      console.log("🔍 DEBUG - Profil récupéré:", profile);

      // Étape 2: Récupérer l'étudiant
      const student = await getStudentByProfileId(profile.id);
      console.log("🔍 DEBUG - Étudiant récupéré:", student);

      // Étape 3: Récupérer la promotion
      const promotion = await getPromotionIdByStudent(student.id);
      console.log("🔍 DEBUG - Promotion récupérée:", promotion);

      // Étape 4: Récupérer les projets de cette promotion
      console.log("🔍 DEBUG - Récupération des projets pour la promotion:",promotion.id_promotion);
      
      if (promotion.name) {
        await fetchProjectsByPromotionName(promotion.name);
      } else if (promotion.id_promotion) {
        await fetchProjectsByPromotion(promotion.id_promotion);
      } else {
        throw new Error("Impossible de déterminer l'identifiant de la promotion");
      }

      console.log("🔍 DEBUG - fetchProjectsForCurrentStudent terminé avec succès");
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur dans fetchProjectsForCurrentStudent:", err);
      console.error("❌ DEBUG - Stack trace:", err.stack);
      setError(err.message || "Erreur inconnue");
      setLoading(false);
    }
  };

  const fetchProjectsByPromotion = async (promotionId: string) => {
    try {
      console.log("🔍 DEBUG - Récupération projets pour promotion:", promotionId);
      setLoading(true);
      const response = await fetch(`http://localhost:3003/projects/promotion/${promotionId}`);

      console.log("🔍 DEBUG - Réponse API promotion:", response.status, response.ok);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des projets de la promotion");
      }

      const result = await response.json();
      console.log("🔍 DEBUG - Données reçues pour promotion:", result);

      if (result.success) {
        console.log("🔍 DEBUG - Nombre de projets trouvés:", result.data?.length || 0);
        setProjects(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur fetchProjectsByPromotion:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer l'id de promotion avec son nom
  const getPromotionIdByName = async (promotionName: string): Promise<string> => {
    console.log("🔍 DEBUG - Recherche promotion par nom:", promotionName);
    const response = await fetch(`http://localhost:3003/promotion/name/${promotionName}`);
    
    console.log("🔍 DEBUG - Réponse API promotion par nom:", response.status, response.ok);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la promotion");
    }

    const result = await response.json();
    console.log("🔍 DEBUG - Données promotion reçues:", result);
    
    if (!result.success) {
      throw new Error(result.message || "Promotion non trouvée");
    }

    console.log("🔍 DEBUG - ID promotion trouvé:", result.data.id);
    return result.data.id;
  };

  // Fonction pour récupérer les projets par nom de promotion
  const fetchProjectsByPromotionName = async (promotionName: string) => {
    try {
      setLoading(true);
      
      // D'abord récupérer l'ID de la promotion avec son nom
      const promotionId = await getPromotionIdByName(promotionName);
      console.log("🔍 DEBUG - Promotion ID récupéré:", promotionId);
      // Ensuite récupérer les projets avec cet ID
      await fetchProjectsByPromotion(promotionId);
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur fetchProjectsByPromotionName:", err);
      setError(err.message || "Erreur inconnue");
      setLoading(false);
    }
  };

  const fetchProjectsByStudent = async (studentId?: string) => {
    try {
      console.log("🔍 DEBUG - Début fetchProjectsByStudent");
      setLoading(true);
      const userId = studentId || getUserIdFromToken();

      console.log("🔍 DEBUG - ID étudiant utilisé:", userId);
      console.log("🔍 DEBUG - studentId paramètre:", studentId);
      console.log("🔍 DEBUG - getUserIdFromToken():", getUserIdFromToken());

      if (!userId) {
        console.error("❌ DEBUG - Pas d'ID utilisateur trouvé");
        throw new Error("Utilisateur non authentifié");
      }

      console.log("🔍 DEBUG - Appel API pour étudiant:", `http://localhost:3003/project-students/student/${userId}`);
      const response = await fetch(`http://localhost:3003/project-students/student/${userId}`);

      console.log("🔍 DEBUG - Réponse API project-students:", response.status, response.ok);

      if (!response.ok) {
        console.error("❌ DEBUG - Erreur réponse API:", response.status, response.statusText);
        throw new Error("Erreur lors du chargement des projets de l'étudiant");
      }

      const result = await response.json();
      console.log("🔍 DEBUG - Données brutes reçues:", result);
      console.log("🔍 DEBUG - result.success:", result.success);
      console.log("🔍 DEBUG - result.data:", result.data);

      if (result.success) {
        console.log("🔍 DEBUG - Nombre d'assignations trouvées:", result.data?.length || 0);
        
        if (result.data && result.data.length > 0) {
          console.log("🔍 DEBUG - Première assignation:", result.data[0]);
        }

        // Récupérer les détails des projets pour chaque assignation
        console.log("🔍 DEBUG - Récupération des détails des projets...");
        const projectDetails = await Promise.all(
          result.data.map(async (assignment: ProjectStudent, index: number) => {
            console.log(`🔍 DEBUG - Traitement assignation ${index}:`, assignment);
            console.log(`🔍 DEBUG - Appel projet ID: ${assignment.id_project}`);
            
            const projectResponse = await fetch(`http://localhost:3003/projects/${assignment.id_project}`);
            console.log(`🔍 DEBUG - Réponse projet ${assignment.id_project}:`, projectResponse.status, projectResponse.ok);
            
            if (projectResponse.ok) {
              const projectResult = await projectResponse.json();
              console.log(`🔍 DEBUG - Détails projet ${assignment.id_project}:`, projectResult);
              
              const projectWithAssignment = {
                ...projectResult.data,
                assignment: assignment
              };
              console.log(`🔍 DEBUG - Projet avec assignation:`, projectWithAssignment);
              return projectWithAssignment;
            } else {
              console.error(`❌ DEBUG - Échec récupération projet ${assignment.id_project}`);
              return null;
            }
          })
        );

        const validProjects = projectDetails.filter(Boolean);
        console.log("🔍 DEBUG - Projets valides filtrés:", validProjects);
        console.log("🔍 DEBUG - Nombre de projets valides:", validProjects.length);
        
        setProjects(validProjects);
      } else {
        console.error("❌ DEBUG - result.success = false, message:", result.message);
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur dans fetchProjectsByStudent:", err);
      console.error("❌ DEBUG - Stack trace:", err.stack);
      setError(err.message || "Erreur inconnue");
    } finally {
      console.log("🔍 DEBUG - Fin fetchProjectsByStudent, loading = false");
      setLoading(false);
    }
  };

  const fetchProjectById = async (projectId: string) => {
    try {
      console.log("🔍 DEBUG - Récupération projet par ID:", projectId);
      setLoading(true);
      const response = await fetch(`http://localhost:3003/projects/${projectId}`);

      console.log("🔍 DEBUG - Réponse API projet par ID:", response.status, response.ok);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du projet");
      }

      const result = await response.json();
      console.log("🔍 DEBUG - Données projet reçues:", result);

      if (result.success) {
        console.log("🔍 DEBUG - Projet défini:", result.data);
        setProjects([result.data]);
      } else {
        throw new Error(result.message || "Erreur lors du chargement du projet");
      }
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur fetchProjectById:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      console.log("🔍 DEBUG - Récupération de tous les projets");
      setLoading(true);
      const response = await fetch("http://localhost:3003/projects");

      console.log("🔍 DEBUG - Réponse API tous projets:", response.status, response.ok);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de tous les projets");
      }

      const result = await response.json();
      console.log("🔍 DEBUG - Tous les projets reçus:", result);

      if (result.success) {
        console.log("🔍 DEBUG - Nombre total de projets:", result.data?.length || 0);
        setProjects(result.data);
      } else {
        throw new Error(result.message || "Erreur lors du chargement des projets");
      }
    } catch (err: any) {
      console.error("❌ DEBUG - Erreur fetchAllProjects:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Debug: Logger les changements d'état
  useEffect(() => {
    console.log("🔍 DEBUG - État projects changé:", projects);
    console.log("🔍 DEBUG - Nombre de projets:", projects.length);
  }, [projects]);

  useEffect(() => {
    console.log("🔍 DEBUG - État loading changé:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("🔍 DEBUG - État error changé:", error);
  }, [error]);

  return {
    projects,
    loading,
    error,
    
    // Fonctions 
    fetchProjectsByPromotion,
    fetchProjectsByPromotionName,
    getPromotionIdByName,
    fetchProjectsByStudent,
    fetchProjectById,
    fetchAllProjects,
    fetchProjectsForCurrentStudent,
    getProfileByUserId,
    getStudentByProfileId,
    getPromotionIdByStudent,
    creating,
    creationError,
    creationResult,
    createAndAssignProject,
    resetCreationState
  };
}