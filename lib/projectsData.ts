// Données des projets (à remplacer par des appels BDD plus tard)
export const projects = [
  {
    id: 1,
    name: "Projet Alpha",
    progress: 85,
    description:
      "Développement d'une application web moderne avec React et Node.js",
    longDescription:
      "Ce projet ambitieux vise à créer une plateforme web complète utilisant les technologies les plus récentes. L'application permettra aux utilisateurs de gérer leurs projets, collaborer en temps réel et suivre leurs objectifs avec des outils avancés d'analytics et de reporting.",
    details: {
      startDate: "15 Janvier 2024",
      endDate: "30 Mars 2024",
      team: "5 développeurs",
    },
    deadline: {
      kickOff: "20 Janvier 2024",
      followUp: "15 Février 2024",
      keynote: "25 Mars 2024",
      daysRemaining: 12,
    },
    documentation: {
      pdfUrl: "/docs/projet-alpha.pdf",
      pdfName: "Spécifications Alpha",
    },
    tasks: [
      "Interface utilisateur terminée",
      "API backend en cours",
      "Tests unitaires à faire",
      "Documentation à compléter",
    ],
    team: [
      { name: "Marie Dubois", role: "Lead Developer", avatar: "👩‍💻" },
      { name: "Thomas Martin", role: "Frontend Developer", avatar: "👨‍💻" },
      { name: "Sophie Bernard", role: "Backend Developer", avatar: "👩‍💻" },
      { name: "Lucas Petit", role: "UI/UX Designer", avatar: "👨‍🎨" },
      { name: "Emma Roux", role: "QA Engineer", avatar: "👩‍🔬" },
    ],
    trophies: [
      { name: "deploy-poll", obtained: true, description: "Déployer le service poll avec succès." },
      { name: "deploy-result", obtained: false, description: "Déployer le service result avec succès." },
      { name: "deploy-worker", obtained: false, description: "Déployer le worker avec succès." },
      { name: "deploy-postgres", obtained: false, description: "Déployer la base de données Postgres." },
      { name: "deploy-redis", obtained: true, description: "Déployer le cache Redis." },
      { name: "deploy-traefik", obtained: false, description: "Déployer le reverse proxy Traefik." },
      { name: "configmap-postgres", obtained: true, description: "Configurer le ConfigMap pour Postgres." },
      { name: "configmap-redis", obtained: true, description: "Configurer le ConfigMap pour Redis." },
      { name: "secrets", obtained: true, description: "Configurer les secrets d'environnement." },
      { name: "env-poll", obtained: true, description: "Configurer les variables d'environnement pour poll." },
      { name: "env-result", obtained: true, description: "Configurer les variables d'environnement pour result." },
      { name: "env-worker", obtained: true, description: "Configurer les variables d'environnement pour worker." },
      { name: "env-postgres", obtained: true, description: "Configurer les variables d'environnement pour Postgres." },
      { name: "vol-postgres", obtained: true, description: "Configurer le volume pour Postgres." },
      { name: "vol-deploy", obtained: true, description: "Configurer le volume pour le déploiement." },
      { name: "service-postgres", obtained: true, description: "Déployer le service Postgres." },
      { name: "service-redis", obtained: true, description: "Déployer le service Redis." },
      { name: "service-poll", obtained: true, description: "Déployer le service poll." },
      { name: "service-traefik", obtained: true, description: "Déployer le service Traefik." },
      { name: "ingress-poll", obtained: true, description: "Configurer l'ingress pour poll." },
      { name: "ingress-result", obtained: true, description: "Configurer l'ingress pour result." },
      { name: "affinity-poll", obtained: true, description: "Configurer l'affinité pour poll." },
      { name: "resources-poll", obtained: true, description: "Configurer les ressources pour poll." },
      { name: "affinity-result", obtained: true, description: "Configurer l'affinité pour result." },
      { name: "resources-result", obtained: true, description: "Configurer les ressources pour result." },
      { name: "affinity-traefik", obtained: false, description: "Configurer l'affinité pour Traefik." },
      { name: "daemonset-cadvisor", obtained: false, description: "Déployer le DaemonSet cadvisor." },
      { name: "daemonset-volume", obtained: false, description: "Configurer le volume pour le DaemonSet." },
      { name: "perfection", obtained: false, description: "Obtenir tous les autres trophées !" },
    ],
    hotTopics: [
      { title: "Déploiement CI/CD", description: "Automatisation du pipeline de déploiement continu." },
      { title: "Sécurité API", description: "Gestion des accès et sécurisation des endpoints." }
    ],
    skills: ["React", "Node.js", "Docker", "CI/CD", "API REST"],
    resources: {
      bootstrap: [
        { name: "Guide de démarrage", action: "Voir", url: "/docs/bootstrap/guide-demarrage.pdf" },
      ],
      kickOff: [
        { name: "Présentation projet", action: "Voir", url: "/docs/kickoff/presentation.pdf" },
        { name: "Planning", action: "Télécharger", url: "/docs/kickoff/planning.xlsx" },
        { name: "Équipe", action: "Voir", url: "/docs/kickoff/equipe.pdf" }
      ],
      projet: [
        { name: "API Documentation", action: "Voir", url: "/docs/api-docs.pdf" },
        { name: "Guide utilisateur", action: "Télécharger", url: "/docs/guide-utilisateur.pdf" }
      ]
    },
    teams: [
      { id: 1, name: 'MAR_5', members: [{ name: 'William LACROIX', avatar: '👤' }], maxMembers: 3 },
      { id: 2, name: 'MAR_1', members: [{ name: 'Paul LOUIS', avatar: '👤' }], maxMembers: 3 },
      { id: 3, name: 'MAR_10', members: [{ name: 'Philippe LEFEVRE', avatar: '👤' }], maxMembers: 3 },
    ],
  },
  
];

// Fonction pour récupérer un projet par son ID
export const getProjectByIdOr = (id: number) => {
  return projects.find(project => project.id === 1);
};

// Fonction pour récupérer tous les projets
export const getAllProjects = () => {
  return projects;
};
