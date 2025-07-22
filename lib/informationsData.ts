export interface Information {
  id: number;
  title: string;
  message: string;
  id_creator: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  is_active: boolean;
}

export interface InformationWithCreator extends Information {
  creator_full_name?: string;
  creator_role?: string;
}

// Base config
const PROFILE_SERVICE_BASE_URL = 'http://localhost:3004';
const REQUEST_TIMEOUT = 5000;

// Utility: fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// ======================= PUBLIC API FUNCTIONS =======================

// GET all active informations (e.g., to filter client-side)
export const getInformations = async (): Promise<Information[]> => {
  const res = await fetchWithTimeout(`${PROFILE_SERVICE_BASE_URL}/informations`);
  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch informations.");
  return result.data;
};

// GET active-only (client-side filtering)
export async function getActiveInformations(): Promise<InformationWithCreator[]> {
  const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/informations`);

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des informations");
  }

  const result = await response.json();
  const data = result.data;

  const enriched = await Promise.all(
    data.map(async (info: any): Promise<InformationWithCreator> => {
      try {
        const profileRes = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${info.id_creator}`);
        const profileResult = await profileRes.json();

        let fullName = "Inconnu";
        let role = undefined;

        if (profileResult.success && profileResult.data) {
          fullName = `${profileResult.data.first_name} ${profileResult.data.last_name}`;
          role = profileResult.data.roles_user;
        }

        return {
          ...info,
          creator_full_name: fullName,
          creator_role: role,
        };
      } catch (err) {
        console.error(`Erreur lors de la récupération du profil pour l’ID ${info.id_creator}:`, err);
        return {
          ...info,
          creator_full_name: "Inconnu",
          creator_role: undefined,
        };
      }
    })
  );

  return enriched;
}

// GET by ID
export const getInformationById = async (id: string): Promise<Information | null> => {
  const res = await fetchWithTimeout(`${PROFILE_SERVICE_BASE_URL}/information/${id}`);
  const result = await res.json();
  if (!result.success) return null;
  return result.data;
};

// CREATE
export const createInformation = async (
  info: Omit<Information, 'id' | 'created_at' | 'updated_at'>
): Promise<Information> => {
  const res = await fetchWithTimeout(`${PROFILE_SERVICE_BASE_URL}/information`, {
    method: 'POST',
    body: JSON.stringify(info),
  });

  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Failed to create information.");
  return result.data;
};

// UPDATE
export const updateInformation = async (
  id: string,
  updates: Partial<Omit<Information, 'id' | 'created_at' | 'updated_at'>>
): Promise<Information> => {
  const res = await fetchWithTimeout(`${PROFILE_SERVICE_BASE_URL}/information/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Failed to update information.");
  return result.data;
};

// DELETE
export const deleteInformation = async (id: string): Promise<void> => {
  const res = await fetchWithTimeout(`${PROFILE_SERVICE_BASE_URL}/information/${id}`, {
    method: 'DELETE',
  });

  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Failed to delete information.");
};
