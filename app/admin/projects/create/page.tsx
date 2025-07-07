"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";
import {
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
  CheckCircle,
  Plus,
  X,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  Trash2,
} from "lucide-react";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import AdminButton from "@/components/admin/buttons/AdminButton";

interface CreateFormData {
  name: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  teamSize: string;
  kickOffDate: string;
  followUpDate: string;
  keynoteDate: string;
  documentationName: string;
  documentationUrl: string;
  tasks: string[];
  is_active: boolean;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateFormData>({
    name: "",
    description: "",
    longDescription: "",
    startDate: "",
    endDate: "",
    teamSize: "",
    kickOffDate: "",
    followUpDate: "",
    keynoteDate: "",
    documentationName: "",
    documentationUrl: "",
    tasks: [""],
    is_active: true,
  });
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

  // Gestion des tâches
  const addTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ""],
    }));
  };

  const removeTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const updateTask = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => (i === index ? value : task)),
    }));
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
    if (!formData.startDate) {
      setError("La date de début est requise");
      return false;
    }
    if (!formData.endDate) {
      setError("La date de fin est requise");
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("La date de fin doit être postérieure à la date de début");
      return false;
    }
    if (!formData.teamSize.trim()) {
      setError("La taille de l'équipe est requise");
      return false;
    }
    if (formData.tasks.some((task) => !task.trim())) {
      setError("Toutes les tâches doivent être renseignées");
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

      const projectData = {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription,
        details: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          team: formData.teamSize,
        },
        deadline: {
          kickOff: formData.kickOffDate,
          followUp: formData.followUpDate,
          keynote: formData.keynoteDate,
        },
        documentation: {
          pdfUrl: formData.documentationUrl,
          pdfName: formData.documentationName,
        },
        tasks: formData.tasks.filter((task) => task.trim()),
        is_active: formData.is_active,
      };

      const response = await fetch("http://localhost:3003/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du projet");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur serveur");
      }

      setSuccess("Projet créé avec succès !");

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push("/admin/projects");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la création:", err);
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

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <ProjectHeader
        title="Créer un nouveau projet"
        description="Ajouter un nouveau projet à la plateforme"
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
              <Plus className="w-6 h-6 text-blue-700" />
            </div>
            Informations du projet
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section Informations générales */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <div className="p-1 bg-blue-200 rounded">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              Informations générales
            </h3>

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

            {/* Description courte */}
            <div className="group">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
              >
                Description courte *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
                placeholder="Description courte du projet..."
                required
              />
            </div>

            {/* Description longue */}
            <div className="group">
              <label
                htmlFor="longDescription"
                className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
              >
                Description détaillée
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
                placeholder="Description détaillée du projet..."
              />
            </div>
          </div>

          {/* Section Dates et planning */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <div className="p-1 bg-blue-200 rounded">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              Dates et planning
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date de début */}
              <div className="group">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Date de début *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                  required
                />
              </div>

              {/* Date de fin */}
              <div className="group">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Date de fin *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Deadlines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <label
                  htmlFor="kickOffDate"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Kick-off
                </label>
                <input
                  type="date"
                  id="kickOffDate"
                  name="kickOffDate"
                  value={formData.kickOffDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="followUpDate"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Follow-up
                </label>
                <input
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="keynoteDate"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Keynote
                </label>
                <input
                  type="date"
                  id="keynoteDate"
                  name="keynoteDate"
                  value={formData.keynoteDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section Équipe */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <div className="p-1 bg-blue-200 rounded">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              Équipe
            </h3>

            <div className="group">
              <label
                htmlFor="teamSize"
                className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
              >
                Taille de l'équipe *
              </label>
              <input
                type="text"
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                placeholder="Ex: 5 développeurs"
                required
              />
            </div>
          </div>

          {/* Section Documentation */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <div className="p-1 bg-blue-200 rounded">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              Documentation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label
                  htmlFor="documentationName"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  Nom du document
                </label>
                <input
                  type="text"
                  id="documentationName"
                  name="documentationName"
                  value={formData.documentationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                  placeholder="Ex: Spécifications du projet"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="documentationUrl"
                  className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                >
                  URL du document
                </label>
                <input
                  type="url"
                  id="documentationUrl"
                  name="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section Tâches */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <div className="p-1 bg-blue-200 rounded">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                Tâches du projet
              </h3>
              <Button
                type="button"
                onClick={addTask}
                className="group flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Ajouter une tâche
              </Button>
            </div>

            <div className="space-y-4">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                    placeholder={`Tâche ${index + 1}`}
                  />
                  {formData.tasks.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2 transition-all duration-300" />
                  Créer le projet
                </>
              )}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}
