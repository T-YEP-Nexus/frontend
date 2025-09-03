# 🎓 Nexus - T-YEP-600-MAR_1

## 🎯 Concept du Projet

**Nexus** est une plateforme web pensée pour répondre à un problème majeur des étudiants : la dispersion des outils et des ressources sur une multitude de plateformes.

Elle a pour objectif de centraliser et unifier l’ensemble des services déployés par les écoles et établissements d’enseignement supérieur, afin d’offrir aux étudiants une expérience plus simple, cohérente et accessible.

### 🌟 Vision

Créer un écosystème numérique complet qui simplifie la vie étudiante en regroupant :

- 📅 **Gestion de calendrier** - Événements, cours et échéances
- 👥 **Gestion des profils** - Étudiants, conseillers et administrateurs  
- 📋 **Gestion de projets** - Suivi des travaux et évaluations
- 🔐 **Authentification unifiée** - Connexion sécurisée centralisée

### 🎯 Cible Actuelle

Initialement conçu pour **Epitech**, Nexus est architecturé pour s'adapter facilement à d'autres établissements d'enseignement supérieur.

### 🚀 Évolutions Futures

La plateforme évoluera avec de nouvelles fonctionnalités qui permettra une compatibilité avec de plus en plus d'établissements.

---

## 🏗️ Architecture Technique

### 🔧 Technologies Backend

| Technologie | Description | Documentation |
|-------------|-------------|---------------|
| **Node.js** 🟢 | Runtime JavaScript pour les services backend | [📚 Docs](https://nodejs.org/docs/latest/api/) |
| **Next.js** ⚡ | Framework full-stack React avec API routes intégrées | [📚 Docs](https://nextjs.org/docs) |
| **Supabase** 🐘 | Base de données moderne, alternative à Firebase | [📚 Docs](https://supabase.com/docs) |
| **Express** 💨 | Framework backend pour créer des API | [📚 Docs](https://expressjs.com/en/starter/installing.html) |

### 🎨 Technologies Frontend

| Technologie | Description | Documentation |
|-------------|-------------|---------------|
| **TypeScript** 🔷 | Typage statique pour une meilleure DX et fiabilité | [📚 Docs](https://www.typescriptlang.org/docs/) |
| **React** ⚛️ | Bibliothèque UI dominante avec écosystème riche | [📚 Docs](https://fr.react.dev/) |

---

## 🏢 Architecture Microservices

Chaque service backend de Nexus est développé dans son propre repository, ce qui facilite la maintenance, le déploiement indépendant et la collaboration :

| Service | Repository |
|---------|------------|
| **Auth Service** 🔐 | [auth-service](https://github.com/T-YEP-Nexus/auth-service) |
| **Calendar Service** 📅 | [calendar-service](https://github.com/T-YEP-Nexus/calendar-service) |
| **Project Service** 📋 | [project-service](https://github.com/T-YEP-Nexus/project-service) |
| **Profile Service** 👥 | [profile-service](https://github.com/T-YEP-Nexus/profile-service) |
| **Frontend** 🖥️ | [frontend](https://github.com/T-YEP-Nexus/frontend) |

> 💡 Chaque repository contient sa propre documentation, ses tests et son workflow de développement.

Nexus utilise une architecture microservices avec **4 services backend** indépendants :

### 🔐 Auth Service

- **Port** : `3001` (par défaut)
- **Responsabilité** : Authentification et gestion des utilisateurs
- **API Documentation** : <http://localhost:3001/api-docs> 📖

### 📅 Calendar Service

- **Port** : `3002` (par défaut)
- **Responsabilité** : Événements, calendrier et participations
- **API Documentation** : <http://localhost:3002/api-docs> 📖

### 📋 Project Service

- **Port** : `3003` (par défaut)
- **Responsabilité** : Projets, affectations et évaluations
- **API Documentation** : <http://localhost:3003/api-docs> 📖

### 👥 Profile Service

- **Port** : `3004` (par défaut)
- **Responsabilité** : Profils utilisateurs et informations
- **API Documentation** : <http://localhost:3004/api-docs> 📖

### 🌐 Frontend

- **Port** : `3000` (par défaut)
- **Technologie** : Next.js avec TypeScript et React
- **Interface** : <http://localhost:3000> 🖥️

> 📋 **Swagger UI** disponible pour chaque service backend à l'adresse `/api-docs`

---

## 🐳 Déploiement avec Docker

### 🚀 Lancement Rapide (Recommandé)

```bash
# 📦 Build des conteneurs
docker compose build

# 🚀 Lancement de la stack complète
docker compose up
```

### 🔧 Options Avancées

```bash
# 🚀 Lancement en arrière-plan
docker compose up -d

# 📊 Voir les logs en temps réel
docker compose logs -f

# 🛑 Arrêt propre
docker compose down
```

---

## 💻 Déploiement Local (Développement)

### ⚙️ Prérequis

- **Node.js** v18+ 🟢
- **npm** ou **yarn** 📦

### 🚀 Étapes de Lancement

#### 1️⃣ Installation des Dépendances

```bash
# Dans chaque service
npm install
```

#### 2️⃣ Lancement des Services Backend

**⚠️ Important** : Lancer **TOUS** les services backend avant le frontend

```bash
# 🔐 Service d'authentification
cd auth-service
npm start

# 📅 Service de calendrier  
cd calendar-service
npm start

# 📋 Service de projets
cd project-service  
npm start

# 👥 Service de profils
cd profile-service
npm start
```

#### 3️⃣ Lancement du Frontend

```bash
# 🌐 Interface utilisateur
cd frontend
npm start
```

### 🌐 Accès aux Services

| Service | URL Locale | Swagger |
|---------|------------|---------|
| **Frontend** 🖥️ | <http://localhost:3000> | - |
| **Auth Service** 🔐 | <http://localhost:3001> | [📖 API Docs](http://localhost:3001/api-docs) |
| **Calendar Service** 📅 | <http://localhost:3002> | [📖 API Docs](http://localhost:3002/api-docs) |
| **Project Service** 📋 | <http://localhost:3003> | [📖 API Docs](http://localhost:3003/api-docs) |
| **Profile Service** 👥 | <http://localhost:3004> | [📖 API Docs](http://localhost:3004/api-docs) |

---

## 🧪 Tests

Chaque service dispose de sa propre suite de tests :

```bash
# Tests pour un service spécifique
cd auth-service
npm test

# Tests précis
npm test -- /path/totestfile
```

---

## 📚 Documentation API

### 🔍 Exploration Interactive

Chaque service expose une **interface Swagger UI** complète pour :

- 📖 Explorer les endpoints disponibles
- 🧪 Tester les API directement depuis le navigateur  
- 📋 Consulter les schémas de données
- ⚙️ Comprendre les codes de réponse

### 🚀 Accès Rapide

- **Auth** : <http://localhost:3001/api-docs>
- **Calendar** : <http://localhost:3002/api-docs>  
- **Project** : <http://localhost:3003/api-docs>
- **Profile** : <http://localhost:3004/api-docs>

---

## 📞 Support & Contact

Pour toute question ou suggestion :

- 🐛 **Issues** : [GitHub Issues](https://github.com/T-YEP-Nexus/frontend/issues/82)
- 📧 **Email** :

| Role | Email |
|---------|------------|
| **Chef de Projet/Lead Tech** | <lucie1.aloccio@epitech.eu> |
| **Lead Backend** 🔐 | <alexis.giove@epitech.eu> |
| **Dev Backend** 📅 | <sacha.morez@epitech.eu> |
| **Lead Frontend** 📋 | <bastian.cruvellier@epitech.eu> |
| **Dev Frontend** 👥 | <damien.marechal@epitech.eu> |

---

⭐ **Star** ce projet si il vous plaît !

Made with ❤️ & 🥲 by Sacha, Bastian, Alexis, Damien & Lucie
