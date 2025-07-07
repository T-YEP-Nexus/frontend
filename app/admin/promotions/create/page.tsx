"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Users,
  BookOpen,
  Building,
  Save,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";

interface PromotionFormData {
  name: string;
  year: string;
  campus: string;
  major: string;
  maxStudents: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PromotionFormData>({
    name: "",
    year: "",
    campus: "",
    major: "",
    maxStudents: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // États pour les dropdowns
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);

  // Références pour les dropdowns
  const campusDropdownRef = useRef<HTMLDivElement>(null);
  const majorDropdownRef = useRef<HTMLDivElement>(null);

  // Options pour les dropdowns
  const campusOptions = [
    "Campus Epitech Paris",
    "Campus Epitech Lyon",
    "Campus Epitech Marseille",
    "Campus Epitech Toulouse",
    "Campus Epitech Nantes",
    "Campus Epitech Bordeaux",
    "Campus Epitech Lille",
    "Campus Epitech Strasbourg",
  ];

  const majorOptions = [
    "Informatique",
    "Cybersécurité",
    "Intelligence Artificielle",
    "Développement Web",
    "Développement Mobile",
    "DevOps",
    "Data Science",
    "Gaming",
  ];

  // Gestionnaire de clic à l'extérieur pour fermer les dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        campusDropdownRef.current &&
        !campusDropdownRef.current.contains(event.target as Node)
      ) {
        setCampusDropdownOpen(false);
      }
      if (
        majorDropdownRef.current &&
        !majorDropdownRef.current.contains(event.target as Node)
      ) {
        setMajorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownSelect = (field: "campus" | "major", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "campus") {
      setCampusDropdownOpen(false);
    } else {
      setMajorDropdownOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implémenter l'API pour créer une promotion
      console.log("Données de la promotion:", formData);

      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirection vers le dashboard admin
      router.push("/admin?success=promotion-created");
    } catch (error) {
      console.error("Erreur lors de la création de la promotion:", error);
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
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Créer une promotion</h2>
                <p className="text-blue-100 text-sm">
                  Créer une nouvelle promotion d'étudiants
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la formation *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: Formation 2027"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année de la formation *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="2027"
                  min="2020"
                  max="2030"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Capacité et dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'étudiants *
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="1"
                  max="200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début de la formation *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin de la formation *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de la formation
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description de la formation, objectifs, particularités..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin")}
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
                    Créer la formation
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Informations sur les promotions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Users size={16} className="mt-0.5 text-blue-600" />
              <div>
                <strong>Gestion des étudiants :</strong> Une fois créée, vous
                pourrez ajouter des étudiants à cette promotion.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={16} className="mt-0.5 text-blue-600" />
              <div>
                <strong>Période :</strong> Les dates définissent la période
                d'activité de la promotion.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building size={16} className="mt-0.5 text-blue-600" />
              <div>
                <strong>Campus :</strong> Détermine le campus principal de la
                promotion.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen size={16} className="mt-0.5 text-blue-600" />
              <div>
                <strong>Spécialité :</strong> Définit la filière principale de
                la promotion.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
