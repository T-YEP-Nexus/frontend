"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";
import usePromotionsData from "@/hooks/usePromotionsData";

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
  ChevronDown,
} from "lucide-react";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminLoading from "@/components/admin/AdminLoading";
import DateTimelineSelector from "@/components/ui/DateTimelineSelector";
import { uploadFileToSupabase, UploadResult } from "@/lib/supabaseStorage";
import { Upload, FileUp, CheckCircle2, XCircle } from "lucide-react";




interface Medal {
  name: string;
  description: string;
  state:boolean;
}

interface Resource {
  name: string;
  url: string;
  description: string;
  category: "kickoff" | "bootstrap" | "project";
  file?: File;
}

interface CreateFormData {
  name: string;
  description: string;
  promotion: string;
  assigned_at: string;
  due_date: string;
  advisor_comment: string | null;
  score: Medal[];
  resources: Resource[];
  max_score: number | string;
  is_active: boolean;
  created_at: string;

}

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateFormData>({
    name: "",
    description: "",
    promotion: "",
    assigned_at: "",
    due_date: "",
    score: [{ name: "", description: "", state:false}],
    max_score: "",
    resources: [
      {
        name: "",
        url: "",
        description: "",
        category: "project",
      },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    advisor_comment: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const medalsContainerRef = useRef<HTMLDivElement>(null);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);
  const promotionDropdownRef = useRef<HTMLDivElement>(null);

  // Hook pour récupérer les promotions
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

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

  // Gestion de la dropdown promotion
  const handlePromotionSelect = (promotion: string) => {
    setFormData((prev) => ({
      ...prev,
      promotion,
    }));
    setPromotionDropdownOpen(false);
  };

  // Gestion du clic à l'extérieur pour fermer la dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promotionDropdownRef.current &&
        !promotionDropdownRef.current.contains(event.target as Node)
      ) {
        setPromotionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion des médailles
  const addMedal = () => {
    setFormData((prev) => ({
      ...prev,
      score: [...prev.score, { name: "", description: "", state: false }],
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
      score: prev.score.filter((_, i) => i !== index),
    }));
  };

  const updateMedal = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      score: prev.score.map((medal, i) =>
        i === index ? { ...medal, [field]: value } : medal
      ),
    }));
  };

  // Gestion des ressources
  const addResource = (category: "kickoff" | "bootstrap" | "project") => {
    setFormData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        { name: "", url: "", description: "", category },
      ],
    }));
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const updateResource = (
    index: number,
    field: "name" | "url" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, i) =>
        i === index ? { ...resource, [field]: value } : resource
      ),
    }));
  };

  const updateResourceFile = (index: number, file: File) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, i) =>
        i === index ? { ...resource, file } : resource
      ),
    }));
  };

const [uploadingFiles, setUploadingFiles] = useState<Record<number, boolean>>({});
const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});
const [uploadSuccess, setUploadSuccess] = useState<Record<number, string>>({});

// Fonction pour gérer l'upload de fichier
const handleFileUpload = async (index: number, file: File) => {
  if (!file) return;

  setUploadingFiles(prev => ({ ...prev, [index]: true }));
  setUploadErrors(prev => ({ ...prev, [index]: '' }));
  setUploadSuccess(prev => ({ ...prev, [index]: '' }));

  try {
    // Upload vers Supabase avec un dossier spécifique pour les projets
    const result: UploadResult = await uploadFileToSupabase(
      file,
      'project-storage', // nom de votre bucket
      'projects/' // dossier dans le bucket
    );

    if (result.success && result.url) {
      // Mettre à jour la ressource avec l'URL obtenue
      setFormData(prev => ({
        ...prev,
        resources: prev.resources.map((resource, i) =>
          i === index 
            ? { 
                ...resource, 
                url: result.url!,
                name: resource.name || file.name, // Utilise le nom du fichier si pas de nom
                file: file 
              } 
            : resource
        ),
      }));

      setUploadSuccess(prev => ({ 
        ...prev, 
        [index]: `Fichier uploadé avec succès: ${result.fileName}` 
      }));
    } else {
      setUploadErrors(prev => ({ 
        ...prev, 
        [index]: result.error || 'Erreur lors de l\'upload' 
      }));
    }
  } catch (error) {
    setUploadErrors(prev => ({ 
      ...prev, 
      [index]: error instanceof Error ? error.message : 'Erreur inconnue' 
    }));
  } finally {
    setUploadingFiles(prev => ({ ...prev, [index]: false }));
  }
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
    if (!formData.promotion) {
      setError("La promotion est requise");
      return false;
    }
    if (!formData.assigned_at) {
      setError("La date de début est requise");
      return false;
    }
    if (!formData.due_date) {
      setError("La date de fin est requise");
      return false;
    }
    if (new Date(formData.assigned_at) >= new Date(formData.due_date)) {
      setError("La date de fin doit être postérieure à la date de début");
      return false;
    }
    // if (!formData.teamSize.trim()) {
    //   setError("La taille de l'équipe est requise");
    //   return false;
    // }
    if (
      formData.score.some(
        (medal) => !medal.name.trim() || !medal.description.trim()
      )
    ) {
      setError("Toutes les médailles doivent avoir un nom et une description");
      return false;
    }
    return true;
  };

  // Fonction utilitaire pour trouver l'ID de la promotion à partir de son nom
  const getPromotionIdByName = (name: string) => {
    if (!promotions) return null;
    const promo = promotions.find((p) => p.name === name);
    return promo ? String(promo.id) : null;
  };

  // Sauvegarde du projet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const promotionId = getPromotionIdByName(formData.promotion);
      if (!promotionId) {
        setError("Promotion invalide ou non trouvée.");
        setSaving(false);
        return;
      }

      // Appel à la fonction utilitaire pour créer le projet
      const { createProjectAndAssignToStudents } = await import("@/lib/projectData");
      await createProjectAndAssignToStudents({
        name: formData.name,
        description: formData.description,
        ressources: formData.resources.map((r) => ({
          filename: r.name,
          url: r.url,
          uploaded_at: new Date().toISOString(),
        })),
        assigned_at: formData.assigned_at,
        due_date: formData.due_date,
        score: formData.score,
        max_score: Number(formData.max_score),
        is_active: formData.is_active,
        id_creator: getUserIdFromToken(),
        id_promotion: promotionId,
        advisor_comment: null,
        id_student: "",
        id_project:"",
      });
      setSuccess("Projet créé avec succès !");
      console.log("Projet créé avec les données:", formData);
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

              {/* Promotion */}
              <div className="group">
                <label className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer">
                  Promotion *
                </label>
                <div className="relative" ref={promotionDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setPromotionDropdownOpen(!promotionDropdownOpen)
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer flex items-center justify-between"
                    disabled={promotionsLoading}
                  >
                    <span
                      className={
                        formData.promotion ? "text-blue-900" : "text-blue-400"
                      }
                    >
                      {promotionsLoading
                        ? "Chargement des promotions..."
                        : formData.promotion || "Sélectionnez une promotion"}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-blue-400 transition-transform duration-300 ${
                        promotionDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {promotionDropdownOpen &&
                    !promotionsLoading &&
                    promotions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {promotions.map((promotion) => (
                          <button
                            key={promotion.id}
                            type="button"
                            onClick={() =>
                              handlePromotionSelect(promotion.name)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-300 cursor-pointer border-b border-blue-100 last:border-b-0"
                          >
                            {promotion.name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                {promotionsError && (
                  <p className="text-red-600 text-sm mt-1">
                    Erreur lors du chargement des promotions: {promotionsError}
                  </p>
                )}
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
                  placeholder="Description du projet..."
                  required
                />
              </div>

              {/* Dates du projet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date de début */}
                <div className="group">
                  <label
                    htmlFor="assigned_at"
                    className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                  >
                    Date de début *
                  </label>
                  <input
                    type="datetime-local"
                    id="assigned_at"
                    name="assigned_at"
                    value={formData.assigned_at}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                    required
                  />
                </div>

                {/* Date de fin */}
                <div className="group">
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                  >
                    Date de fin *
                  </label>
                  <input
                    type="datetime-local"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    min={formData.assigned_at}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Timeline du projet - COMMENTÉE
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/50">
            <h3 className="text-xl font-bold text-green-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-200 to-green-300 rounded-xl">
                <Calendar className="w-5 h-5 text-green-700" />
              </div>
              Timeline du projet
            </h3>
            <div className="space-y-6">
              <DateTimelineSelector
                assigned_at={formData.assigned_at}
                due_date={formData.due_date}
                kickOffDate={formData.kickOffDate}
                followUpDate={formData.followUpDate}
                keynoteDate={formData.keynoteDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div> */}

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200/50">
  <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-3 mb-6">
    <div className="p-2 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl">
      <FileText className="w-5 h-5 text-emerald-700" />
    </div>
    Ressources du projet
  </h3>
  <div className="space-y-4">
    {formData.resources.map((resource, index) => (
      <div
        key={index}
        className="space-y-3 p-4 border-2 border-emerald-200 rounded-xl bg-emerald-50/50 group"
      >
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-emerald-900">
            Ressource {index + 1}
          </h5>
          <Button
            type="button"
            onClick={() => removeResource(index)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom de la ressource */}
          <div className="group">
            <label className="block text-sm font-semibold text-emerald-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
              Nom de la ressource *
            </label>
            <input
              type="text"
              value={resource.name}
              onChange={(e) =>
                updateResource(index, "name", e.target.value)
              }
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-white text-emerald-900 placeholder-emerald-400 transition-all duration-300 hover:border-emerald-400 hover:shadow-md focus:shadow-lg cursor-text"
              placeholder="Ex: Documentation du projet"
              required
            />
          </div>

          {/* Upload de fichier OU URL manuelle */}
          <div className="group">
            <label className="block text-sm font-semibold text-emerald-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
              Fichier de la ressource
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(index, file);
                  }
                }}
                accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif"
                disabled={uploadingFiles[index]}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-white text-emerald-900 transition-all duration-300 hover:border-emerald-400 hover:shadow-md focus:shadow-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {/* Indicateur de chargement */}
              {uploadingFiles[index] && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                </div>
              )}
            </div>
          </div>

          {/* URL manuelle (si pas de fichier uploadé) */}
          <div className="group md:col-span-2">
            <label className="block text-sm font-semibold text-emerald-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
              URL de la ressource
            </label>
            <input
              type="url"
              value={resource.url}
              onChange={(e) =>
                updateResource(index, "url", e.target.value)
              }
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-white text-emerald-900 placeholder-emerald-400 transition-all duration-300 hover:border-emerald-400 hover:shadow-md focus:shadow-lg cursor-text"
              placeholder="https://... (généré automatiquement lors de l'upload ou à saisir manuellement)"
              readOnly={uploadingFiles[index]}
            />
          </div>

          {/* Types de fichiers acceptés */}
          <div className="group md:col-span-2">
            <div className="px-4 py-2 border-2 border-emerald-200 rounded-xl bg-emerald-50/30 text-emerald-700 text-xs">
              Types acceptés: PDF, DOC, DOCX, TXT, MD, JPG, PNG, GIF
            </div>
          </div>
        </div>
      </div>
    ))}

    <div className="flex justify-center">
      <AdminButton
        type="button"
        onClick={() => addResource("project")}
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
        Ajouter une ressource
      </AdminButton>
    </div>
  </div>
</div>

          {/* Section Hot Topics et Compétences - COMMENTÉE
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200/50">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl">
                <CheckSquare className="w-5 h-5 text-amber-700" />
              </div>
              Hot Topics et Compétences
            </h3>
            <div className="space-y-6">
              <div className="group">
                <label
                  htmlFor="hotTopics"
                  className="block text-sm font-semibold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors duration-300 cursor-pointer"
                >
                  Hot Topics
                </label>
                <textarea
                  id="hotTopics"
                  name="hotTopics"
                  value={formData.hotTopics}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 bg-white text-amber-900 placeholder-amber-400 transition-all duration-300 hover:border-amber-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
                  placeholder="Ex: Intelligence artificielle, Blockchain, Cloud Computing..."
                />
              </div>

              <div className="group">
                <label
                  htmlFor="skills"
                  className="block text-sm font-semibold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors duration-300 cursor-pointer"
                >
                  Compétences mobilisées
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 bg-white text-amber-900 placeholder-amber-400 transition-all duration-300 hover:border-amber-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
                  placeholder="Ex: React, Node.js, Python, Machine Learning..."
                />
              </div>
            </div>
          </div> */}

          {/* Section Équipe - COMMENTÉE
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
          </div> */}

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
                {formData.score.map((medal, index) => (
                  <div
                    key={index}
                    className="space-y-3 p-4 border-2 border-pink-200 rounded-xl bg-pink-50/50 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-pink-900">
                        Médaille {index + 1}
                      </h4>
                      {formData.score.length > 1 && (
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
                        <label className="block text-sm font-semibold text-pink-900 mb-2 group-hover:text-pink-700 transition-colors duration-300 cursor-pointer">
                          Nom de la médaille *
                        </label>
                        <input
                          type="text"
                          value={medal.name}
                          onChange={(e) =>
                            updateMedal(index, "name", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-white text-pink-900 placeholder-pink-400 transition-all duration-300 hover:border-pink-400 hover:shadow-md focus:shadow-lg cursor-text"
                          placeholder="Ex: Médaille d'or"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-pink-900 mb-2 group-hover:text-pink-700 transition-colors duration-300 cursor-pointer">
                          Description de la médaille *
                        </label>
                        <textarea
                          value={medal.description}
                          onChange={(e) =>
                            updateMedal(index, "description", e.target.value)
                          }
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-white text-pink-900 placeholder-pink-400 transition-all duration-300 hover:border-pink-400 hover:shadow-md focus:shadow-lg resize-none cursor-text"
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
