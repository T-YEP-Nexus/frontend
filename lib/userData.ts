import { profile } from "console";
import { getUserEmailFromToken } from "./auth";

export interface UserSkill {
  name: string;
  level: number;
}

export interface UserMedal {
  name: string;
  icon: string;
  obtained: boolean;
}

export interface UserProject {
  name: string;
  grade?: number | null;
  status: "completed" | "in-progress" | "pending";
}

export interface ChartData {
  monthlyHours: Array<{
    label: string;
    value: number;
  }>;
  skillsRadar: Array<{
    label: string;
    value: number;
  }>;
  projectsPie: Array<{
    label: string;
    value: number;
  }>;
}

export interface UserStats {
  totalHours: number;
  projectsCompleted: number;
  ectsCredits: number;
  attendanceRate: number;
  skills: UserSkill[];
  badges: UserMedal[];
  recentProjects: UserProject[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  campus: string;
  studentNumber: string;
  promotion: string;
  major: string;
  role: string;
  profileImage: string;
  stats: UserStats;
  chartData: ChartData;
}

// Données utilisateur par défaut
export const defaultUserData: UserProfile = {
  id: "1",
  firstName: "Valentin",
  lastName: "Dupont",
  email: "valentin.dupont@epitech.eu",
  phone: "+33 6 12 34 56 78",
  address: "15 rue Carotte 13006 Marseille",
  campus: "Campus Epitech Marseille",
  studentNumber: "MSC-001",
  promotion: "Promotion 2027",
  major: "Cybersécurity",
  role: "Étudiant Epitech",
  profileImage: "/images/Avatar.png",
  stats: {
    totalHours: 1247,
    projectsCompleted: 23,
    ectsCredits: 87,
    attendanceRate: 94.5,
    skills: [
      { name: "React", level: 85 },
      { name: "Node.js", level: 78 },
      { name: "Python", level: 92 },
      { name: "TypeScript", level: 88 },
      { name: "Docker", level: 75 },
      { name: "AWS", level: 70 }
    ],
    badges: [
      { name: "Premier Projet", icon: "faMedal", obtained: true },
      { name: "100h de Code", icon: "faFire", obtained: true },
      { name: "Excellence", icon: "faCrown", obtained: true },
      { name: "Team Player", icon: "faMedal", obtained: false },
      { name: "Innovation", icon: "faFire", obtained: true },
      { name: "Mentor", icon: "faCrown", obtained: false }
    ],
    recentProjects: [
      { name: "T-DEV-500", grade: 18, status: "completed" },
      { name: "T-YOP-700", grade: 16, status: "completed" },
      { name: "T-SEN-700", grade: 17, status: "in-progress" },
      { name: "T-CEN-100", grade: null, status: "pending" }
    ]
  },
  chartData: {
    monthlyHours: [
      { label: "Jan", value: 120 },
      { label: "Fév", value: 95 },
      { label: "Mar", value: 140 },
      { label: "Avr", value: 110 },
      { label: "Mai", value: 160 },
      { label: "Juin", value: 135 }
    ],
    skillsRadar: [
      { label: "React", value: 85 },
      { label: "Node.js", value: 78 },
      { label: "Python", value: 92 },
      { label: "TypeScript", value: 88 },
      { label: "Docker", value: 75 },
      { label: "AWS", value: 70 }
    ],
    projectsPie: [
      { label: "Terminés", value: 18 },
      { label: "En cours", value: 3 },
      { label: "En attente", value: 2 }
    ]
  }
};

// Fonction pour vérifier si un service est disponible
const isServiceAvailable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes timeout

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

// Fonction pour récupérer les données utilisateur avec fallback
export const getUserProfileData = async (userId: string) => {
  const url = `http://localhost:3004/profile/user/${userId}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const user = await res.json();
    return user.data;
  } catch (error) {
    console.warn("Service profile indisponible, utilisation des données par défaut:", error);
    // Retourner des données par défaut basées sur la structure attendue
    return {
      id: userId,
      first_name: defaultUserData.firstName,
      last_name: defaultUserData.lastName,
      phone: defaultUserData.phone,
      address: defaultUserData.address,
      campus: defaultUserData.campus,
      roles_user: defaultUserData.role,
      profileImage: defaultUserData.profileImage,
      stats: defaultUserData.stats,
      chartData: defaultUserData.chartData
    };
  }
};

// Fonction pour récupérer les données étudiant avec fallback
export const getStudentData = async (userId: string) => {
  const url = `http://localhost:3004/student/profile/${userId}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const student = await res.json();
    console.log("Réponse studentData:", student);

    if (!student.success) {
      throw new Error(student.message);
    }

    return student.data;
  } catch (error) {
    console.warn("Service student indisponible, utilisation des données par défaut:", error);
    // Retourner des données par défaut basées sur la structure attendue
    return {
      student_number: defaultUserData.studentNumber,
      promotion: defaultUserData.promotion,
      major: defaultUserData.major
    };
  }
};

export const getUserData = async (userId: string): Promise<UserProfile> => {
  const emailToken = getUserEmailFromToken();

  try {
    console.log("Récupération des données utilisateur pour:", userId);

    // Étape 1 : Récupérer le profil utilisateur (avec fallback)
    const profileData = await getUserProfileData(userId);
    console.log("Données profil récupérées:", profileData);

    // Étape 2 : Récupérer les données étudiant (avec fallback)
    const studentData = await getStudentData(profileData.id);
    console.log("Données étudiant récupérées:", studentData);

    const userData: UserProfile = {
      id: profileData.id,
      firstName: profileData.first_name || defaultUserData.firstName,
      lastName: profileData.last_name || defaultUserData.lastName,
      email: emailToken || defaultUserData.email,
      phone: profileData.phone || defaultUserData.phone,
      address: profileData.address || defaultUserData.address,
      campus: profileData.campus || defaultUserData.campus,
      role: profileData.roles_user || defaultUserData.role,
      profileImage: profileData.profileImage || defaultUserData.profileImage,
      stats: profileData.stats || defaultUserData.stats,
      chartData: profileData.chartData || defaultUserData.chartData,
      studentNumber: studentData.student_number || defaultUserData.studentNumber,
      promotion: studentData.promotion || defaultUserData.promotion,
      major: studentData.major || defaultUserData.major,
    };

    console.log("Données utilisateur finales:", userData);
    return userData;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    console.log("Utilisation des données par défaut complètes");

    return {
      ...defaultUserData,
      id: userId,
      email: emailToken || defaultUserData.email
    };
  }
};

// Fonction pour mettre à jour les données utilisateur
export const updateUserData = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 200));

  // Pour l'instant, retourne les données mises à jour
  // Plus tard, cela pourrait faire un appel API réel
  return { ...defaultUserData, ...updates };
};

// Fonction pour mettre à jour l'image de profil
export const updateProfileImage = async (userId: string, imageUrl: string): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://localhost:3004/profile/user/${userId}/image`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileImage: imageUrl }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Image de profil mise à jour pour l'utilisateur ${userId}: ${imageUrl}`);
  } catch (error) {
    console.warn("Service indisponible pour la mise à jour de l'image, opération simulée:", error);
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Image de profil mise à jour localement pour l'utilisateur ${userId}: ${imageUrl}`);
  }
};

export interface NewUserInput {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  campus?: string
  is_active?: boolean
  roles_user?: string
  // Attributs spécifiques student
  student_number?: string
  promotion?: string
  major?: string
  // Attributs spécifiques advisor
  room?: string
  availability?: string
  specialty?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export async function createCompleteUser(input: NewUserInput) {
  try {
    // 1. Création du user
    const resUser = await fetch('http://localhost:3001/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password
      })
    });
    if (!resUser.ok) {
      const err = await resUser.json();
      throw new Error(err.message || 'Échec création user');
    }
    const { data: userData } = (await resUser.json()) as ApiResponse<{ id: string }>;

    // 2. Création du user-profile
    const resProfile = await fetch('http://localhost:3004/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_user: userData!.id,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        address: input.address,
        campus: input.campus,
        is_active: input.is_active,
        roles_user: input.roles_user
        
      })
    });
    if (!resProfile.ok) {
      const err = await resProfile.json();
      throw new Error(err.message || 'Échec création profile');
    }
    const { data: profileData } = (await resProfile.json()) as ApiResponse<{ id: number }>;

    // 3. Création selon le rôle
    let roleSpecificData = null;
    
    if (input.roles_user === 'student') {
      const resStudent = await fetch('http://localhost:3004/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user_profile: profileData!.id,
          student_number: input.student_number,
          promotion: input.promotion,
          major: input.major
        })
      });
      if (!resStudent.ok) {
        const err = await resStudent.json();
        throw new Error(err.message || 'Échec création student');
      }
      const { data: studentData } = (await resStudent.json()) as ApiResponse<unknown>;
      roleSpecificData = studentData;
    } 
    else if (input.roles_user === 'advisor') {
      const resAdvisor = await fetch('http://localhost:3004/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user_profile: profileData!.id,
          room: input.room,
          availability: input.availability,
          specialty: input.specialty
        })
      });
      if (!resAdvisor.ok) {
        const err = await resAdvisor.json();
        throw new Error(err.message || 'Échec création advisor');
      }
      const { data: advisorData } = (await resAdvisor.json()) as ApiResponse<unknown>;
      roleSpecificData = advisorData;
    }
    else if (input.roles_user === 'admin') {
      const resAdmin = await fetch('http://localhost:3004/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user_profile: profileData!.id
        })
      });
      if (!resAdmin.ok) {
        const err = await resAdmin.json();
        throw new Error(err.message || 'Échec création admin');
      }
      const { data: adminData } = (await resAdmin.json()) as ApiResponse<unknown>;
      roleSpecificData = adminData;
    }

    const result = {
      user: userData,
      profile: profileData,
      role: roleSpecificData
    };
    console.log('createCompleteUser result:', result);
    return result;

  } catch (error) {
    console.error('createCompleteUser error:', error);
    throw error;
  }
}