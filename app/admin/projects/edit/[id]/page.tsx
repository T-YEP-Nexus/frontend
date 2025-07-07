"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";
import {
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
  CheckCircle,
  X,
  Edit3,
} from "lucide-react";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import AdminButton from "@/components/admin/buttons/AdminButton";

interface Project {
  id: string;
  name: string;
  description: string;
  ressources: Array<{
    filename: string;
    url: string;
    description?: string;
    uploaded_at: string;
  }>;
  is_active: boolean;
  id_creator: string;
  created_at: string;
  updated_at: string;
}

interface EditFormData {
  name: string;
  description: string;
  is_active: boolean;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    description: "",
    is_active: true,
  });
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Récupérer le rôle de l'utilisateur connecté
  const { userData: currentUser, loading: userLoading } = useUserData(
    getUserIdFromToken()
  );

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Vérifier les droits d'accès
  useEffect(() => {
    if (!userLoading && userRole && !["admin", "advisor"].includes(userRole)) {
      router.push("/dashboard?error=unauthorized");
    }
  }, [userRole, userLoading, router]);

  // Récupérer les données du projet
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3003/projects/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du projet");
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Erreur serveur");
        }

        const projectData = result.data;
        setProject(projectData);
        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          is_active:
            projectData.is_active !== undefined ? projectData.is_active : true,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération du projet:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Gestion des changements de formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Effacer les messages d'erreur/succès
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Le nom du projet est requis");
      return false;
    }
    if (!formData.description.trim()) {
      setError("La description du projet est requise");
      return false;
    }
    return true;
  };

  // Sauvegarde du projet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `http://localhost:3003/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du projet");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur serveur");
      }

      setSuccess("Projet modifié avec succès !");

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push("/admin/projects");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  // Affichage du loading utilisateur
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Vérification des droits
  if (!userRole || !["admin", "advisor"].includes(userRole)) {
    return null;
  }

  // Affichage du loading projet
  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-blue-800 text-lg">Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error && !project) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 text-lg font-semibold">
              Erreur lors du chargement du projet
            </p>
            <p className="text-blue-800 text-sm mb-4">{error}</p>
            <Button
              onClick={() => router.push("/admin/projects")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft size={16} />
              Retour aux projets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <ProjectHeader
        title="Modifier le projet"
        description="Modifier les informations du projet"
        backIcon={<ArrowLeft className="w-4 h-4" />}
      />



      {/* Messages d'erreur/succès */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 hover:bg-red-100 transition-colors duration-300 cursor-default">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 hover:bg-green-100 transition-colors duration-300 cursor-default">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200/50 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Edit3 className="w-6 h-6 text-blue-700" />
            </div>
            Informations du projet
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nom du projet */}
          <div className="group">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
            >
              Nom du projet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
              placeholder="Entrez le nom du projet"
              required
            />
          </div>

          {/* Description */}
          <div className="group">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
              placeholder="Décrivez le projet..."
              required
            />
          </div>

          {/* Statut actif */}
          <div className="flex items-center gap-3 group cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-all duration-300">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 hover:border-blue-400 transition-all duration-300 cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-semibold text-blue-900 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
            >
              Projet actif
            </label>
          </div>

          {/* Informations du projet (lecture seule) */}
          {project && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 space-y-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-default">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <div className="p-1 bg-blue-200 rounded group-hover:bg-blue-300 transition-colors duration-300">
                  <X className="w-4 h-4 text-blue-600" />
                </div>
                Informations système (lecture seule)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors duration-300 cursor-default">
                  <span className="font-medium text-blue-700">
                    ID du projet :
                  </span>
                  <p className="text-blue-900 font-mono">{project.id}</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors duration-300 cursor-default">
                  <span className="font-medium text-blue-700">Créé le :</span>
                  <p className="text-blue-900">
                    {new Date(project.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors duration-300 cursor-default">
                  <span className="font-medium text-blue-700">
                    Dernière modification :
                  </span>
                  <p className="text-blue-900">
                    {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors duration-300 cursor-default">
                  <span className="font-medium text-blue-700">Créateur :</span>
                  <p className="text-blue-900 font-mono">
                    {project.id_creator}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-6 border-t-2 border-blue-200">
            <Button
              type="button"
              onClick={() => router.push("/admin/projects")}
              variant="outline"
              className="group flex-1 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              disabled={saving}
            >
              <span className="group-hover:scale-105 transition-transform duration-300">
                Annuler
              </span>
            </Button>
            <AdminButton
              type="submit"
              disabled={saving}
              className="flex-1 hover:scale-100 rounded-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2 transition-all duration-300" />
                  Sauvegarder les modifications
                </>
              )}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}
