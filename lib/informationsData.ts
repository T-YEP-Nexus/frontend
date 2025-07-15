export interface Information {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: 'admin' | 'advisor' | 'external';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Données statiques pour l'instant
const informationsData: Information[] = [
  {
    id: '1',
    title: 'Bienvenue sur la plateforme T-YEP',
    content: 'Nous sommes ravis de vous accueillir sur notre plateforme dédiée aux projets étudiants. Découvrez les opportunités qui s\'offrent à vous et commencez votre parcours dès aujourd\'hui. Cette plateforme vous permettra de gérer vos projets, collaborer avec vos équipes et suivre votre progression académique.',
    author: 'Équipe T-YEP',
    authorRole: 'admin',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Nouveaux projets disponibles pour la promotion 2024',
    content: 'Plusieurs nouveaux projets ont été ajoutés à la plateforme pour la promotion 2024. Ces projets couvrent différents domaines : développement web, intelligence artificielle, cybersécurité et bien plus encore. N\'hésitez pas à consulter les détails et à postuler pour ceux qui vous intéressent. Les équipes seront constituées de 3 à 5 étudiants selon les projets.',
    author: 'Marie Dubois',
    authorRole: 'advisor',
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'Maintenance prévue - Weekend du 27-28 janvier',
    content: 'Une maintenance de la plateforme est prévue le weekend prochain (27-28 janvier 2024). Les services pourront être temporairement indisponibles entre 22h00 le samedi et 06h00 le dimanche. Cette maintenance permettra d\'améliorer les performances et d\'ajouter de nouvelles fonctionnalités. Nous vous remercions de votre compréhension.',
    author: 'Équipe Technique',
    authorRole: 'admin',
    isActive: true,
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '4',
    title: 'Rappel : Validation des émargements',
    content: 'N\'oubliez pas de valider votre émargement avant 17h15 chaque jour. Toute absence non justifiée sera comptabilisée dans votre dossier. Les justificatifs doivent être déposés dans les 48h suivant l\'absence. Pour toute question, contactez votre conseiller pédagogique.',
    author: 'Jean Martin',
    authorRole: 'advisor',
    isActive: true,
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: '5',
    title: 'Réunion pédagogique - Mardi 30 janvier à 14h',
    content: 'Une réunion pédagogique est prévue mardi 30 janvier à 14h en salle A101. Cette réunion sera l\'occasion de faire le point sur les projets en cours et de répondre à vos questions. Tous les étudiants et conseillers sont invités à y participer. Ordre du jour : bilan des projets, planning des soutenances, questions diverses.',
    author: 'Sophie Bernard',
    authorRole: 'admin',
    isActive: true,
    createdAt: '2024-01-26T16:20:00Z',
    updatedAt: '2024-01-26T16:20:00Z'
  },
  {
    id: '6',
    title: 'Ancienne annonce de test',
    content: 'Cette annonce n\'est plus active et ne devrait pas être visible côté client.',
    author: 'Test User',
    authorRole: 'external',
    isActive: false,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z'
  },
  {
    id: '7',
    title: 'Nouveaux outils de collaboration disponibles',
    content: 'De nouveaux outils de collaboration ont été ajoutés à la plateforme : partage de documents en temps réel, chat intégré pour les équipes, et système de suivi des tâches. Ces outils vous permettront de mieux organiser votre travail en équipe et de suivre l\'avancement de vos projets. Un tutoriel est disponible dans la section "Aide".',
    author: 'Pierre Durand',
    authorRole: 'advisor',
    isActive: true,
    createdAt: '2024-01-28T13:10:00Z',
    updatedAt: '2024-01-28T13:10:00Z'
  }
];

// Fonctions pour gérer les données (simulation d'API)
export const getInformations = (): Information[] => {
  return [...informationsData];
};

export const getActiveInformations = (): Information[] => {
  return informationsData.filter(info => info.isActive);
};

export const getInformationById = (id: string): Information | undefined => {
  return informationsData.find(info => info.id === id);
};

export const createInformation = (information: Omit<Information, 'id' | 'createdAt' | 'updatedAt'>): Information => {
  const newInformation: Information = {
    ...information,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  informationsData.push(newInformation);
  return newInformation;
};

export const updateInformation = (id: string, updates: Partial<Omit<Information, 'id' | 'createdAt'>>): Information | null => {
  const index = informationsData.findIndex(info => info.id === id);
  if (index === -1) return null;

  informationsData[index] = {
    ...informationsData[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return informationsData[index];
};

export const deleteInformation = (id: string): boolean => {
  const index = informationsData.findIndex(info => info.id === id);
  if (index === -1) return false;

  informationsData.splice(index, 1);
  return true;
};

export const toggleInformationStatus = (id: string): Information | null => {
  const information = getInformationById(id);
  if (!information) return null;

  return updateInformation(id, { isActive: !information.isActive });
};
