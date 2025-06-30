"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const createProjectForUser = async () => {
      try {
        const email = "morezsacha@gmail.com";
        console.log(`Recherche de l'utilisateur avec l'email : ${email}`);

        const userResponse = await fetch(`http://localhost:3001/users/email/${email}`);

        if (!userResponse.ok) {
          throw new Error(`Erreur lors de la récupération de l'utilisateur : ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        const userId = userData.data.id; 
        console.log("Utilisateur trouvé avec ID :", userId);

        const projectPayload = {
          name: "Nouveau INDEX Test",
          description: "Voici un projet test généré INDEXedienxe",
          ressources: [
            { "url": "https://example.com/doc1.pdf", "filename": "doc1.pdf" },
            { "url": "https://example.com/doc2.pdf", "filename": "doc2.pdf" }
          ],
          is_active: true,
          id_creator: userId
        };

        console.log("Envoi du projet avec payload :", projectPayload);

        const projectResponse = await fetch("http://localhost:3003/project/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectPayload)
        });

        if (!projectResponse.ok) {
          const errData = await projectResponse.json();
          throw new Error(`Erreur lors de la création du projet : ${errData.message}`);
        }

        const createdProject = await projectResponse.json();
        console.log("Projet créé avec succès :", createdProject);

      } catch (error) {
        console.error("Erreur détaillée :", error);
      }
    };

    createProjectForUser();
  }, []);

  return <h1>Création Projet à partir Email</h1>;
}
