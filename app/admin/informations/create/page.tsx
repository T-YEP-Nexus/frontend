"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Save,
  Loader2,
  Search,
  ChevronDown,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";

interface InformationFormData {
  title: string;
  content: string;
  author: string;
  authorRole: "admin" | "advisor" | "external";
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  roles_user: string;
}

export default function CreateInformationPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [authorSearchTerm, setAuthorSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const authorDropdownRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<InformationFormData>({
    title: "",
    content: "",
    author: "",
    authorRole: "admin",
  });
  const [showExternalAuthorInput, setShowExternalAuthorInput] = useState(false);
  const [externalAuthorName, setExternalAuthorName] = useState("");

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  // Gestionnaire de clic à l'extérieur pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authorDropdownRef.current &&
        !authorDropdownRef.current.contains(event.target as Node)
      ) {
        setAuthorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction pour charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      // Récupérer tous les profils utilisateurs
      const profilesResponse = await fetch("http://localhost:3004/profiles");
      if (!profilesResponse.ok) {
        throw new Error("Erreur lors de la récupération des profils");
      }
      const profilesData = await profilesResponse.json();

      if (!profilesData.success) {
        throw new Error(profilesData.message || "Erreur serveur");
      }

      // Récupérer tous les conseillers
      const advisorsResponse = await fetch("http://localhost:3004/advisors");
      const advisorsData = advisorsResponse.ok
        ? await advisorsResponse.json()
        : { success: false, data: [] };

      // Récupérer tous les administrateurs
      const adminsResponse = await fetch("http://localhost:3004/admins");
      const adminsData = adminsResponse.ok
        ? await adminsResponse.json()
        : { success: false, data: [] };

      // Combiner les données pour obtenir les advisors et admins avec leurs profils
      const advisorsWithProfiles = advisorsData.success
        ? advisorsData.data
            .map((advisor: any) => {
              const profile = profilesData.data.find(
                (p: any) => p.id === advisor.id_user_profile
              );
              return profile
                ? {
                    id: profile.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    roles_user: "advisor",
                  }
                : null;
            })
            .filter(Boolean)
        : [];

      const adminsWithProfiles = adminsData.success
        ? adminsData.data
            .map((admin: any) => {
              const profile = profilesData.data.find(
                (p: any) => p.id === admin.id_user_profile
              );
              return profile
                ? {
                    id: profile.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    roles_user: "admin",
                  }
                : null;
            })
            .filter(Boolean)
        : [];

      const allUsers = [...advisorsWithProfiles, ...adminsWithProfiles];
      setUsers(allUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Fonction pour filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(authorSearchTerm.toLowerCase())
  );

  // Fonction pour sélectionner un auteur
  const selectAuthor = (user: User | null) => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        author: `${user.first_name} ${user.last_name}`,
        authorRole: user.roles_user as "admin" | "advisor" | "external",
      }));
      setShowExternalAuthorInput(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        author: "Autre (utilisateur externe)",
        authorRole: "external",
      }));
      setShowExternalAuthorInput(true);
    }
    setAuthorDropdownOpen(false);
    setAuthorSearchTerm("");
  };

  // Fonction pour gérer le changement dans le champ texte externe
  const handleExternalAuthorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExternalAuthorName(e.target.value);
  };

  // Fonction pour obtenir le label du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "advisor":
        return "Conseiller";
      default:
        return role;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Si c'est un auteur externe, utiliser le nom saisi
      const finalFormData = {
        ...formData,
        author:
          formData.authorRole === "external"
            ? externalAuthorName
            : formData.author,
      };

      // TODO: Implémenter l'API pour créer une information
      console.log("Données de l'information:", finalFormData);

      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirection vers la page des informations
      router.push("/admin/informations?success=information-created");
    } catch (error) {
      console.error("Erreur lors de la création de l'information:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <ProjectHeader backIcon={<ArrowLeft />} />

      <div className="max-w-4xl mx-auto">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Créer une information</h2>
                <p className="text-blue-100 text-sm">
                  Créer une nouvelle annonce générale
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre de l'information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'information *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Titre de l'information"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                placeholder="Contenu de l'information"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Auteur de l'information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auteur de l'information
              </label>

              {/* Dropdown pour sélectionner l'auteur */}
              <div className="relative" ref={authorDropdownRef}>
                <div
                  onClick={() => {
                    if (!authorDropdownOpen && authorDropdownRef.current) {
                      const rect =
                        authorDropdownRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 5,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                    setAuthorDropdownOpen(!authorDropdownOpen);
                  }}
                  className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <span
                    className={
                      formData.author
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {formData.author || "Sélectionner un auteur"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${
                      authorDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {authorDropdownOpen && (
                  <div
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-hidden"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                    }}
                  >
                    {/* Barre de recherche */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Rechercher un utilisateur..."
                          value={authorSearchTerm}
                          onChange={(e) => setAuthorSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Liste des utilisateurs */}
                    <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {/* Option "Autre" */}
                      <div
                        onClick={() => selectAuthor(null)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Users className="text-gray-600" size={16} />
                          </div>
                          <div>
                            <span className="text-gray-900 font-medium">
                              Autre (utilisateur externe)
                            </span>
                            <p className="text-xs text-gray-600">
                              Utilisateur non enregistré
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Utilisateurs de la base de données */}
                      {usersLoading ? (
                        <div className="px-4 py-3 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-600" />
                          <p className="text-sm text-gray-600 mt-1">
                            Chargement...
                          </p>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="px-4 py-3 text-center text-sm text-gray-600">
                          Aucun utilisateur trouvé
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => selectAuthor(user)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="text-blue-600" size={16} />
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-900 font-medium">
                                  {user.first_name} {user.last_name}
                                </span>
                                <p className="text-xs text-gray-600">
                                  {getRoleLabel(user.roles_user)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Champ texte pour auteur externe */}
            {showExternalAuthorInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'auteur externe *
                </label>
                <input
                  type="text"
                  value={externalAuthorName}
                  onChange={handleExternalAuthorChange}
                  placeholder="Entrez le nom de l'auteur externe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/informations")}
                className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Créer l'information
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
