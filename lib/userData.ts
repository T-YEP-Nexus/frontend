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
  campus: string;
  promotion: string;
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
  campus: "Campus Epitech Marseille",
  promotion: "Promotion 2027",
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

// Fonction pour obtenir les données utilisateur (simulation d'API)
export const getUserData = async (userId: string): Promise<UserProfile> => {
  const emailToken = getUserEmailFromToken();
  const res = await fetch(`http://localhost:3004/profile/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Erreur lors de la récupération des données utilisateur");

  const user = await res.json();

  return {
    id: user.data.id,
    firstName: user.data.first_name,
    lastName: user.data.last_name,
    email: emailToken,
    phone: user.data.phone,
    campus: user.data.campus,
    promotion: user.data.promotion,
    role: user.data.role,
    profileImage: user.data.profileImage,
    stats: user.data.stats,
    chartData: user.data.chartData,
  } as UserProfile;
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
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 300));

  // Plus tard, cela pourrait uploader l'image vers un serveur
  console.log(`Image de profil mise à jour pour l'utilisateur ${userId}: ${imageUrl}`);
};
