"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Users,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";

interface ImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  campus: string;
  role: string;
  promotion?: string;
  major?: string;
  studentNumber?: string;
}

export default function BulkImportPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      parseCSVFile(file);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide");
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const data: ImportData[] = [];
      const newErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Validation des données
          if (!row.firstName || !row.lastName || !row.email) {
            newErrors.push(`Ligne ${i + 1}: Nom, prénom et email requis`);
            continue;
          }

          if (!row.email.includes("@")) {
            newErrors.push(`Ligne ${i + 1}: Email invalide`);
            continue;
          }

          data.push({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || "",
            campus: row.campus || "",
            role: row.role || "student",
            promotion: row.promotion || "",
            major: row.major || "",
            studentNumber: row.studentNumber || "",
          });
        }
      }

      setPreviewData(data);
      setErrors(newErrors);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      alert("Veuillez corriger les erreurs avant de procéder à l'import");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implémenter l'API pour l'import en masse
      console.log("Données à importer:", previewData);

      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccessCount(previewData.length);

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/admin?success=bulk-import");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,campus,role,promotion,major,studentNumber
Jean,Dupont,jean.dupont@epitech.eu,+33123456789,Campus Epitech Paris,student,Promotion 2027,Informatique,MSC-001
Marie,Martin,marie.martin@epitech.eu,+33987654321,Campus Epitech Lyon,student,Promotion 2027,Cybersécurité,MSC-002
Pierre,Durand,pierre.durand@epitech.eu,+33111222333,Campus Epitech Marseille,advisor,,,`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_utilisateurs.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <ProjectHeader backHref="/admin" backIcon={<ArrowLeft />} />

      <div className="max-w-6xl mx-auto">
        {/* Zone d'upload */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Import en masse d'utilisateurs
                </h2>
                <p className="text-blue-100 text-sm">
                  Importez plusieurs utilisateurs à partir d'un fichier CSV
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Template et instructions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Instructions
                </h3>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Télécharger le template
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <h4 className="font-semibold mb-2">Format du fichier CSV :</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>firstName, lastName, email</strong> : Champs
                    obligatoires
                  </li>
                  <li>
                    <strong>phone, campus</strong> : Champs optionnels
                  </li>
                  <li>
                    <strong>role</strong> : "student", "advisor" ou "admin"
                    (défaut: "student")
                  </li>
                  <li>
                    <strong>promotion, major, studentNumber</strong> : Pour les
                    étudiants uniquement
                  </li>
                </ul>
              </div>
            </div>

            {/* Zone de drop */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Cliquez pour sélectionner un fichier CSV
                </p>
                <p className="text-sm text-gray-500">
                  ou glissez-déposez votre fichier ici
                </p>
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle size={16} />
                  <span className="font-medium">Fichier sélectionné :</span>
                  <span>{uploadedFile.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aperçu des données */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Aperçu des données ({previewData.length} utilisateurs)
                </h3>
                <div className="flex gap-2">
                  {errors.length > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle size={16} />
                      <span className="text-sm">{errors.length} erreur(s)</span>
                    </div>
                  )}
                  <Button
                    onClick={handleImport}
                    disabled={isProcessing || errors.length > 0}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <Users size={16} />
                        Importer {previewData.length} utilisateurs
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Campus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Promotion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "advisor"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.campus || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.promotion || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length > 10 && (
              <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
                ... et {previewData.length - 10} autres utilisateurs
              </div>
            )}
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-900 mb-3">
              Erreurs détectées ({errors.length})
            </h3>
            <div className="space-y-2">
              {errors.slice(0, 5).map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-red-800"
                >
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
              {errors.length > 5 && (
                <div className="text-sm text-red-600">
                  ... et {errors.length - 5} autres erreurs
                </div>
              )}
            </div>
          </div>
        )}

        {/* Succès */}
        {successCount > 0 && (
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Import réussi !
            </h3>
            <p className="text-green-800">
              {successCount} utilisateur(s) ont été importé(s) avec succès.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
