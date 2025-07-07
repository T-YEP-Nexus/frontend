"use client";

import React, { useState, useEffect, useRef } from "react";
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
import AdminLoading from "@/components/admin/AdminLoading";
import DateTimelineSelector from "@/components/ui/DateTimelineSelector";

interface Medal {
  name: string;
  description: string;
}

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
  medals: Medal[];
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
    medals: [{ name: "", description: "" }],
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const medalsContainerRef = useRef<HTMLDivElement>(null);

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

  // Gestion des changements de dates via le timeline
  const handleDateChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Effacer les messages d'erreur/succès
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Gestion des médailles
  const addMedal = () => {
    setFormData((prev) => ({
      ...prev,
      medals: [...prev.medals, { name: "", description: "" }],
    }));

    // Scroll vers la nouvelle médaille après un court délai
    setTimeout(() => {
      if (medalsContainerRef.current) {
        medalsContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Scroll supplémentaire pour aller plus bas
        setTimeout(() => {
          window.scrollBy({
            top: 100,
            behavior: "smooth",
          });
        }, 300);
      }
    }, 100);
  };

  const removeMedal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medals: prev.medals.filter((_, i) => i !== index),
    }));
  };

  const updateMedal = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      medals: prev.medals.map((medal, i) =>
        i === index ? { ...medal, [field]: value } : medal
      ),
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
    if (
      formData.medals.some(
        (medal) => !medal.name.trim() || !medal.description.trim()
      )
    ) {
      setError("Toutes les médailles doivent avoir un nom et une description");
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
        medals: formData.medals.filter(
          (medal) => medal.name.trim() && medal.description.trim()
        ),
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
    return <AdminLoading message="Vérification des droits d'accès..." />;
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200/50">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              Informations générales
            </h3>
            <div className="space-y-6">
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
          </div>

          {/* Section Timeline du projet */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/50">
            <h3 className="text-xl font-bold text-green-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-200 to-green-300 rounded-xl">
                <Calendar className="w-5 h-5 text-green-700" />
              </div>
              Timeline du projet
            </h3>
            <div className="space-y-6">
              <DateTimelineSelector
                startDate={formData.startDate}
                endDate={formData.endDate}
                kickOffDate={formData.kickOffDate}
                followUpDate={formData.followUpDate}
                keynoteDate={formData.keynoteDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>

          {/* Section Équipe */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border-2 border-purple-200/50">
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              Équipe
            </h3>
            <div className="space-y-6">
              <div className="group">
                <label
                  htmlFor="teamSize"
                  className="block text-sm font-semibold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors duration-300 cursor-pointer"
                >
                  Taille de l'équipe *
                </label>
                <input
                  type="text"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white text-purple-900 placeholder-purple-400 transition-all duration-300 hover:border-purple-400 hover:shadow-md focus:shadow-lg cursor-text"
                  placeholder="Ex: 5 développeurs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Documentation */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200/50">
            <h3 className="text-xl font-bold text-orange-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl">
                <FileText className="w-5 h-5 text-orange-700" />
              </div>
              Documentation
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label
                    htmlFor="documentationName"
                    className="block text-sm font-semibold text-orange-900 mb-2 group-hover:text-orange-700 transition-colors duration-300 cursor-pointer"
                  >
                    Nom du document
                  </label>
                  <input
                    type="text"
                    id="documentationName"
                    name="documentationName"
                    value={formData.documentationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 bg-white text-orange-900 placeholder-orange-400 transition-all duration-300 hover:border-orange-400 hover:shadow-md focus:shadow-lg cursor-text"
                    placeholder="Ex: Spécifications du projet"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="documentationFile"
                    className="block text-sm font-semibold text-orange-900 mb-2 group-hover:text-orange-700 transition-colors duration-300 cursor-pointer"
                  >
                    Fichier de documentation
                  </label>
                  <input
                    type="file"
                    id="documentationFile"
                    name="documentationFile"
                    accept=".pdf,.doc,.docx,.txt"
                    className="w-full px-4 py-1.5 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 bg-white text-orange-900 transition-all duration-300 hover:border-orange-400 hover:shadow-md focus:shadow-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="documentationUrl"
                  className="block text-sm font-semibold text-orange-900 mb-2 group-hover:text-orange-700 transition-colors duration-300 cursor-pointer"
                >
                  URL du document (optionnel)
                </label>
                <input
                  type="url"
                  id="documentationUrl"
                  name="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 bg-white text-orange-900 placeholder-orange-400 transition-all duration-300 hover:border-orange-400 hover:shadow-md focus:shadow-lg cursor-text"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section Médailles */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200/50">
            <h3 className="text-xl font-bold text-pink-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-pink-200 to-pink-300 rounded-xl">
                <CheckSquare className="w-5 h-5 text-pink-700" />
              </div>
              Médailles du projet
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                {formData.medals.map((medal, index) => (
                  <div
                    key={index}
                    className="space-y-3 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Médaille {index + 1}
                      </h4>
                      {formData.medals.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeMedal(index)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="group">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer">
                          Nom de la médaille *
                        </label>
                        <input
                          type="text"
                          value={medal.name}
                          onChange={(e) =>
                            updateMedal(index, "name", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-text"
                          placeholder="Ex: Médaille d'or"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer">
                          Description de la médaille *
                        </label>
                        <textarea
                          value={medal.description}
                          onChange={(e) =>
                            updateMedal(index, "description", e.target.value)
                          }
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
                          placeholder="Description de la médaille..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div ref={medalsContainerRef} className="flex justify-center">
                <AdminButton type="button" onClick={addMedal}>
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Ajouter une médaille
                </AdminButton>
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200/50">
            <h3 className="text-xl font-bold text-teal-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-200 to-teal-300 rounded-xl">
                <CheckSquare className="w-5 h-5 text-teal-700" />
              </div>
              Statut du projet
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-3 group cursor-pointer p-4 rounded-xl hover:bg-teal-100/50 transition-all duration-300 border-2 border-teal-200/30">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-teal-600 border-2 border-teal-300 rounded focus:ring-teal-500 focus:ring-2 hover:border-teal-400 transition-all duration-300 cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-teal-900 group-hover:text-teal-700 transition-colors duration-300 cursor-pointer"
                >
                  Projet actif
                </label>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200/50">
            <div className="flex gap-4">
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
          </div>
        </form>
      </div>
    </div>
  );
}
