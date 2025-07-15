"use client";

import React, { useState } from "react";
import { ArrowLeft, GraduationCap, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";

interface PromotionFormData {
  name: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PromotionFormData>({
    name: "",
  });

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
            {/* Nom de la formation */}
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
      </div>
    </div>
  );
}
