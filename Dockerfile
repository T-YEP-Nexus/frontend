FROM node:20-alpine

WORKDIR /app

# Copiez d'abord package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers
COPY . .

# Exposez le port (optionnel mais recommandé)
EXPOSE 3000

# Démarrez l'application
CMD ["npm", "run", "dev"]