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
import { useRouter, useParams } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import {
  getInformations,
  updateInformation,
  type Information,
} from "@/lib/informationsData";
import AdminLoading from "@/components/admin/AdminLoading";

interface InformationFormData {
  title: string;
  content: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  roles_user: string;
}

export default function EditInformationPage() {
  const router = useRouter();
  const params = useParams();
  const informationId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [information, setInformation] = useState<Information | null>(null);
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
  });

  // Charger l'information et les utilisateurs au montage du composant
  useEffect(() => {
    loadInformation();
    fetchUsers();
  }, [informationId]);

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

  // Fonction pour charger l'information
  const loadInformation = async () => {
    try {
      setIsLoading(true);
      const informations = await getInformations();
      const foundInformation = informations.find(
        (info) => info.id === Number(informationId)
      );

      if (foundInformation) {
        setInformation(foundInformation);
        setFormData({
          title: foundInformation.title,
          content: foundInformation.message,
        });
      } else {
        // Rediriger si l'information n'existe pas
        router.push("/admin/informations?error=information-not-found");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'information:", error);
      router.push("/admin/informations?error=load-error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      // Récupérer tous les profils utilisateurs
      const profilesResponse = await fetch("http://localhost:3004/profiles", {
        credentials: "include",
      });

      if (!profilesResponse.ok) {
        throw new Error("Erreur lors de la récupération des profils");
      }
      const profilesData = await profilesResponse.json();

      if (!profilesData.success) {
        throw new Error(profilesData.message || "Erreur serveur");
      }

      // Récupérer tous les conseillers
      const advisorsResponse = await fetch("http://localhost:3004/advisors", {
        credentials: "include",
      });

      const advisorsData = advisorsResponse.ok
        ? await advisorsResponse.json()
        : { success: false, data: [] };

      // Récupérer tous les administrateurs
      const adminsResponse = await fetch("http://localhost:3004/admins", {
        credentials: "include",
      });

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
      // This function is no longer needed as author/authorRole are removed
    } else {
      // This function is no longer needed as author/authorRole are removed
    }
    setAuthorDropdownOpen(false);
    setAuthorSearchTerm("");
  };

  // Fonction pour gérer le changement dans le champ texte externe
  const handleExternalAuthorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // This function is no longer needed as author/authorRole are removed
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
      if (information) {
        const finalFormData = {
          title: formData.title,
          message: formData.content,
        };

        await updateInformation(String(information.id), finalFormData);
        router.push("/admin/informations?success=information-updated");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'information:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <ProjectHeader backIcon={<ArrowLeft />} />
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <AdminLoading message="Chargement de l'information..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!information) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <ProjectHeader backIcon={<ArrowLeft />} />
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Information non trouvée
              </h2>
              <p className="text-gray-600 mb-4">
                L'information que vous recherchez n'existe pas ou a été
                supprimée.
              </p>
              <Button
                onClick={() => router.push("/admin/informations")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retour aux informations
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h2 className="text-xl font-bold">Modifier l'information</h2>
                <p className="text-blue-100 text-sm">
                  Modifier l'annonce générale
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
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Modifier l'information
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
