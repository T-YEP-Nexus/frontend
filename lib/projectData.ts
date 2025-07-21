export interface ProjectResource {
  filename: string;
  url: string;
  description?: string;
  uploaded_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ressources: ProjectResource[];
  is_active: boolean;
  id_creator: string;
  id_promotion: string;
  created_at: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalResources: number;
}

export interface ProjectFilters {
  creatorId?: string;
  promotionId?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

export interface NewProjectInput {
  name: string;
  description: string;
  ressources: ProjectResource[];
  is_active?: boolean;
  id_creator: string;
  id_promotion: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  ressources?: ProjectResource[];
  is_active?: boolean;
  id_promotion?: string;
}

// Données de projet par défaut pour les tests/fallback
export const defaultProjectData: Project[] = [
  {
    id: "1",
    name: "T-DEV-500",
    description: "Développement d'une application web full-stack avec React et Node.js",
    ressources: [
      {
        filename: "sujet_tdev500.pdf",
        url: "/resources/tdev500.pdf",
        description: "Sujet principal du projet",
        uploaded_at: "2024-01-15T10:00:00Z"
      },
      {
        filename: "annexe_tdev500.pdf", 
        url: "/resources/annexe_tdev500.pdf",
        description: "Annexe technique",
        uploaded_at: "2024-01-15T10:30:00Z"
      }
    ],
    is_active: true,
    id_creator: "creator-1",
    id_promotion: "promotion-2027",
    created_at: "2024-01-15T09:00:00Z"
  },
  {
    id: "2",
    name: "T-YOP-700",
    description: "Projet de fin d'année - Conception et développement d'un système distribué",
    ressources: [
      {
        filename: "sujet_tyop700.pdf",
        url: "/resources/tyop700.pdf",
        description: "Cahier des charges",
        uploaded_at: "2024-02-01T14:00:00Z"
      }
    ],
    is_active: true,
    id_creator: "creator-2",
    id_promotion: "promotion-2027",
    created_at: "2024-02-01T13:00:00Z"
  },
  {
    id: "3",
    name: "T-SEN-700",
    description: "Projet de sécurité - Audit et pentest d'application web",
    ressources: [
      {
        filename: "sujet_tsen700.pdf",
        url: "/resources/tsen700.pdf",
        description: "Sujet et méthodologie",
        uploaded_at: "2024-02-15T16:00:00Z"
      }
    ],
    is_active: false,
    id_creator: "creator-1",
    id_promotion: "promotion-2027",
    created_at: "2024-02-15T15:00:00Z"
  }
];

// Configuration des services
const PROJECT_SERVICE_BASE_URL = 'http://localhost:3003';
const REQUEST_TIMEOUT = 5000;

// Fonction utilitaire pour vérifier la disponibilité du service
const isServiceAvailable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Fonction utilitaire pour les requêtes avec timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// ===================== RÉCUPÉRATION DES PROJETS =====================

// Récupérer tous les projets
export const getAllProjects = async (): Promise<Project[]> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data || [];
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    return defaultProjectData;
  }
};

// Récupérer un projet par ID
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data || null;
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    const defaultProject = defaultProjectData.find(p => p.id === projectId);
    return defaultProject || null;
  }
};

// Récupérer les projets par créateur
export const getProjectsByCreator = async (creatorId: string): Promise<Project[]> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/creator/${creatorId}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data || [];
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    return defaultProjectData.filter(p => p.id_creator === creatorId);
  }
};

// Récupérer les projets par promotion
export const getProjectsByPromotion = async (promotionId: string): Promise<Project[]> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/promotion/${promotionId}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data || [];
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    return defaultProjectData.filter(p => p.id_promotion === promotionId);
  }
};

// Récupérer seulement les projets actifs
export const getActiveProjects = async (): Promise<Project[]> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/active/list`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data || [];
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    return defaultProjectData.filter(p => p.is_active);
  }
};

// ===================== GESTION DES PROJETS =====================

// Créer un nouveau projet
export const createProject = async (projectData: NewProjectInput): Promise<Project> => {
  try {
    const resProject = await fetch('http://localhost:3003/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectData.name,
        description: projectData.description,
        ressources: projectData.ressources || [],
        is_active: projectData.is_active ?? true,
        id_creator: projectData.id_creator,
        id_promotion: projectData.id_promotion
      })
    });

    if (!resProject.ok) {
      const err = await resProject.json();
      throw new Error(err.message || 'Échec création projet');
    }

    const apiResponse = (await resProject.json()) as ApiResponse<Project>;
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'Échec création projet');
    }
    console.log('Projet créé avec succès:', apiResponse.data);
    return apiResponse.data;
  } catch (error) {
    throw new Error(`Erreur lors de la création du projet : ${error instanceof Error ? error.message : String(error)}`);
  }
};


// Mettre à jour un projet
export const updateProject = async (projectId: string, updates: UpdateProjectInput): Promise<Project> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorResult: ApiResponse<never> = await response.json();
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to update project');
    }

    console.log('Projet mis à jour avec succès:', result.data);
    return result.data;
  } catch (error) {
    console.warn("Service projects indisponible, simulation de la mise à jour:", error);
    
    // Simulation de la mise à jour pour les tests
    const existingProject = defaultProjectData.find(p => p.id === projectId);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    const updatedProject: Project = {
      ...existingProject,
      ...updates,
    };

    // Mettre à jour dans les données par défaut
    const index = defaultProjectData.findIndex(p => p.id === projectId);
    if (index !== -1) {
      defaultProjectData[index] = updatedProject;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Projet mis à jour localement (simulation):', updatedProject);
    return updatedProject;
  }
};

// Supprimer un projet
export const deleteProject = async (projectId: string): Promise<void> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorResult: ApiResponse<never> = await response.json();
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ deletedProject: Project }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete project');
    }

    console.log('Projet supprimé avec succès:', result.data?.deletedProject);
  } catch (error) {
    console.warn("Service projects indisponible, simulation de la suppression:", error);
    
    // Simulation de la suppression pour les tests
    const index = defaultProjectData.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const deletedProject = defaultProjectData.splice(index, 1)[0];
    
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Projet supprimé localement (simulation):', deletedProject);
  }
};

// Basculer le statut actif/inactif d'un projet
export const toggleProjectActive = async (projectId: string): Promise<Project> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}/toggle-active`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'PATCH'
    });

    if (!response.ok) {
      const errorResult: ApiResponse<never> = await response.json();
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Project> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to toggle project status');
    }

    console.log('Statut du projet basculé avec succès:', result.data);
    return result.data;
  } catch (error) {
    console.warn("Service projects indisponible, simulation du basculement:", error);
    
    // Simulation du basculement pour les tests
    const project = defaultProjectData.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.is_active = !project.is_active;

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Statut du projet basculé localement (simulation):', project);
    return project;
  }
};

// ===================== GESTION DES RESSOURCES =====================

// Récupérer les ressources d'un projet
export const getProjectResources = async (projectId: string): Promise<{ project_name: string; resources: ProjectResource[]; resources_count: number }> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}/resources`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ project_name: string; resources: ProjectResource[]; resources_count: number }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch project resources');
    }

    return result.data;
  } catch (error) {
    console.warn("Service projects indisponible, utilisation des données par défaut:", error);
    
    const project = defaultProjectData.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return {
      project_name: project.name,
      resources: project.ressources || [],
      resources_count: project.ressources ? project.ressources.length : 0
    };
  }
};

// Ajouter une ressource à un projet
export const addProjectResource = async (projectId: string, resource: Omit<ProjectResource, 'uploaded_at'>): Promise<{ project: Project; added_resource: ProjectResource }> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}/resources`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(resource)
    });

    if (!response.ok) {
      const errorResult: ApiResponse<never> = await response.json();
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ project: Project; added_resource: ProjectResource }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to add resource');
    }

    console.log('Ressource ajoutée avec succès:', result.data.added_resource);
    return result.data;
  } catch (error) {
    console.warn("Service projects indisponible, simulation de l'ajout de ressource:", error);
    
    const project = defaultProjectData.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newResource: ProjectResource = {
      ...resource,
      uploaded_at: new Date().toISOString()
    };

    project.ressources = [...(project.ressources || []), newResource];

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Ressource ajoutée localement (simulation):', newResource);
    
    return {
      project: project,
      added_resource: newResource
    };
  }
};

// Supprimer une ressource d'un projet
export const removeProjectResource = async (projectId: string, filename: string): Promise<{ project: Project; removed_resource: ProjectResource }> => {
  const url = `${PROJECT_SERVICE_BASE_URL}/projects/${projectId}/resources/${encodeURIComponent(filename)}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorResult: ApiResponse<never> = await response.json();
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ project: Project; removed_resource: ProjectResource }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to remove resource');
    }

    console.log('Ressource supprimée avec succès:', result.data.removed_resource);
    return result.data;
  } catch (error) {
    console.warn("Service projects indisponible, simulation de la suppression de ressource:", error);
    
    const project = defaultProjectData.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const resourceIndex = project.ressources.findIndex(r => r.filename === filename);
    if (resourceIndex === -1) {
      throw new Error('Resource not found');
    }

    const removedResource = project.ressources.splice(resourceIndex, 1)[0];

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Ressource supprimée localement (simulation):', removedResource);
    
    return {
      project: project,
      removed_resource: removedResource
    };
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

// Filtrer les projets selon des critères
export const filterProjects = (projects: Project[], filters: ProjectFilters): Project[] => {
  let filteredProjects = [...projects];

  if (filters.creatorId) {
    filteredProjects = filteredProjects.filter(p => p.id_creator === filters.creatorId);
  }

  if (filters.promotionId) {
    filteredProjects = filteredProjects.filter(p => p.id_promotion === filters.promotionId);
  }

  if (filters.isActive !== undefined) {
    filteredProjects = filteredProjects.filter(p => p.is_active === filters.isActive);
  }

  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  return filteredProjects;
};

// Obtenir des statistiques sur les projets
export const getProjectStats = async (filters?: ProjectFilters): Promise<ProjectStats> => {
  try {
    const allProjects = await getAllProjects();
    const filteredProjects = filters ? filterProjects(allProjects, filters) : allProjects;

    const stats: ProjectStats = {
      totalProjects: filteredProjects.length,
      activeProjects: filteredProjects.filter(p => p.is_active).length,
      completedProjects: filteredProjects.filter(p => !p.is_active).length,
      totalResources: filteredProjects.reduce((total, project) => total + (project.ressources?.length || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalResources: 0
    };
  }
};

// Rechercher des projets
export const searchProjects = async (query: string, filters?: Omit<ProjectFilters, 'searchTerm'>): Promise<Project[]> => {
  try {
    const allProjects = await getAllProjects();
    const searchFilters: ProjectFilters = { ...filters, searchTerm: query };
    return filterProjects(allProjects, searchFilters);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return [];
  }
};

// Fonction pour vérifier si un projet existe
export const projectExists = async (projectId: string): Promise<boolean> => {
  try {
    const project = await getProjectById(projectId);
    return project !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence du projet:', error);
    return false;
  }
};

// Fonction pour obtenir les projets récents
export const getRecentProjects = async (limit: number = 10): Promise<Project[]> => {
  try {
    const allProjects = await getAllProjects();
    return allProjects
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets récents:', error);
    return [];
  }
};