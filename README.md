# Nexus
## Projet
Réalisation d'une plateforme web regroupant les outils déployés par les écoles et l'enseignement supérieur à destination des étudiants. Pour l'instant à destination d'Epitech, l'application va se voir améliorer dans un futur proche afin d'accueillir de nouvelle fonctionnalité.
## Technos
### Back End
* Next.js : Gère à la fois le front end et le back end(notamment les routes API) dans un seul projet. De plus le front end étant en React, la gestion par Next.js est plus pointu.
* Supabase : Base de données à la fois moderne et gratuite elle reste une bonne alternative à Firebase. Orienté vers JavaScript/TypeScript.
* Node.js Permet le fonctionnement de Next.js, mais gère aussi le côté client pour Supabase. Il est aussi nécessaire pour run l'application Next sur un serveur.

### Front End
* TypeScript : Meilleure expérience développeur notamment via une auto-complétion et une détection d'erreurs à l'écriture. Souvent utilisé dans des projets modernes avec la présence de React. L'avantage du typage statique augmente la fiabilité du code.
* React : Bibiliothèque front end principalement dominante, des librairies déjà créées qui ont déjà fait leurs preuves. Compatible avec Next.js qui lui-même repose sur React. Une documentation vaste qui permet de debug rapidement et de s'adapter à des situations particulières.


## Commande docker

## Commande lancement local
Utilisé la commande suivante : ***npm run dev***  
Afin de lancer le projet, il est nécessaire tout d'abord de lancer tous les repos services (auth-service, calendar-service,...) afin d'avoir accès via le repos frontend aux différentes pages de Nexus. Quand tous les services sont lancés, on peut faire la même commande dans le repo frontend qui se déploiera en localhost.
