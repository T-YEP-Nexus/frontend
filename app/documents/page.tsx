"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import BackgroundBubbles from "@/components/Background/BackgroundBubbles";
import {
  Search,
  Plus,
  Download,
  FileText,
  X,
  Eye,
  Upload,
  Users,
  GraduationCap,
  Building,
  CloudUpload,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Header from "@/components/Header/Header";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import AdminLoading from "@/components/admin/AdminLoading";

// Types pour les documents
interface Document {
  id: number;
  name: string;
  size: string;
  type: string;
  category: string;
  uploadDate: string;
  studentId?: string;
  studentName?: string;
  isRequested: boolean;
}

// Types pour les étudiants
interface Student {
  id: string;
  name: string;
  email: string;
  promotion: string;
}

// Types pour les promotions
interface Promotion {
  id: string;
  name: string;
  students: Student[];
}

// Documents d'exemple pour les étudiants
const studentDocuments = [
  {
    id: 1,
    name: "Certificat de scolarité 2024-2025",
    size: "245 ko",
    type: "PDF",
    category: "Scolarité",
    uploadDate: "15/01/2025",
    isRequested: false,
  },
  {
    id: 2,
    name: "Contrat d'apprentissage",
    size: "1.2 Mo",
    type: "PDF",
    category: "Contrat",
    uploadDate: "10/01/2025",
    isRequested: false,
  },
  {
    id: 3,
    name: "Convention de stage",
    size: "890 ko",
    type: "PDF",
    category: "Stage",
    uploadDate: "05/01/2025",
    isRequested: false,
  },
  {
    id: 4,
    name: "Attestation d'assurance",
    size: "156 ko",
    type: "PDF",
    category: "Administratif",
    uploadDate: "03/01/2025",
    isRequested: false,
  },
];

// Documents demandés par l'admin
const requestedDocuments = [
  {
    id: 5,
    name: "Justificatif de domicile",
    size: "0 ko",
    type: "PDF",
    category: "Administratif",
    uploadDate: "En attente",
    isRequested: true,
  },
  {
    id: 6,
    name: "Relevé de notes semestre 1",
    size: "0 ko",
    type: "PDF",
    category: "Scolarité",
    uploadDate: "En attente",
    isRequested: true,
  },
];

// Promotions d'exemple pour l'admin
const mockPromotions: Promotion[] = [
  {
    id: "1",
    name: "Promotion 2025",
    students: [
      {
        id: "1",
        name: "Martin Dupont",
        email: "martin.dupont@epitech.eu",
        promotion: "Promotion 2025",
      },
      {
        id: "2",
        name: "Sophie Martin",
        email: "sophie.martin@epitech.eu",
        promotion: "Promotion 2025",
      },
      {
        id: "3",
        name: "Lucas Bernard",
        email: "lucas.bernard@epitech.eu",
        promotion: "Promotion 2025",
      },
    ],
  },
  {
    id: "2",
    name: "Promotion 2024",
    students: [
      {
        id: "4",
        name: "Emma Roux",
        email: "emma.roux@epitech.eu",
        promotion: "Promotion 2024",
      },
      {
        id: "5",
        name: "Thomas Leroy",
        email: "thomas.leroy@epitech.eu",
        promotion: "Promotion 2024",
      },
    ],
  },
];

// Zone de dépôt moderne pour les étudiants
const StudentDropZone = ({
  onUpload,
  requestedDoc,
}: {
  onUpload: (file: File, docId: number) => void;
  requestedDoc: Document;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulation d'upload progressif
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    onUpload(file, requestedDoc.id);
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <div
      className={`relative group transition-all duration-300 ${
        isDragOver ? "scale-105" : "scale-100"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? "border-blue-400 bg-blue-50/50"
            : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50"
        } hover:border-blue-300 hover:bg-blue-50/30`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Fond avec motif */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[length:20px_20px] opacity-60"></div>

        <div className="relative p-8 text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  Upload en cours...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <CloudUpload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {requestedDoc.name}
              </h3>
              <p className="text-gray-600 mb-6">
                Glissez-déposez votre fichier ici ou cliquez pour sélectionner
              </p>

              <div className="flex items-center justify-center gap-3">
                <input
                  type="file"
                  id={`file-${requestedDoc.id}`}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor={`file-${requestedDoc.id}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sélectionner un fichier
                </label>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG acceptés
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal pour l'upload de documents (Admin)
const AdminUploadModal = ({
  open,
  onClose,
  onUpload,
  selectedStudent,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (doc: any) => void;
  selectedStudent: string;
}) => {
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setDocumentName("");
      setCategory("");
      setFile(null);
    }
  }, [open]);

  const categories = [
    "Scolarité",
    "Contrat",
    "Stage",
    "Administratif",
    "Certification",
    "Autre",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent && documentName && file) {
      setIsLoading(true);
      try {
        // Simulation d'upload
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const student = mockPromotions
          .flatMap((p) => p.students)
          .find((s) => s.id === selectedStudent);

        onUpload({
          id: Date.now(),
          name: documentName,
          size: `${Math.round(file.size / 1024)} ko`,
          type: file.name.split(".").pop()?.toUpperCase() || "PDF",
          category,
          uploadDate: new Date().toLocaleDateString("fr-FR"),
          studentId: selectedStudent,
          studentName: student?.name,
        });

        // Reset form
        setDocumentName("");
        setCategory("");
        setFile(null);
        onClose();
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            Uploader un document
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de l'étudiant sélectionné */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Étudiant sélectionné :</strong>{" "}
              {mockPromotions
                .flatMap((p) => p.students)
                .find((s) => s.id === selectedStudent)?.name || "N/A"}
            </p>
          </div>

          {/* Catégorie du document */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Catégorie du document
            </label>
            <div className="relative">
              <div
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center justify-between px-6 py-4 border-2 border-blue-200 rounded-2xl bg-white/80 backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <span
                  className={
                    !category ? "text-blue-400" : "text-blue-900 font-medium"
                  }
                >
                  {!category ? "Sélectionner une catégorie" : category}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-blue-400 transition-transform duration-300 ${
                    categoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {categoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {categories
                    .filter((cat) => cat !== "Tous")
                    .map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                      >
                        <span className="text-blue-900">{cat}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Nom du document */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Nom du document
            </label>
            <input
              type="text"
              placeholder="Ex: Certificat de scolarité"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
          </div>

          {/* Fichier */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Fichier
            </label>
            <input
              type="file"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          {/* Bouton d'upload */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={isLoading || !selectedStudent || !documentName || !file}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Uploader le document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal pour demander un document à un étudiant
const RequestDocumentModal = ({
  open,
  onClose,
  selectedStudent,
  onRequest,
}: {
  open: boolean;
  onClose: () => void;
  selectedStudent: string;
  onRequest: (doc: any) => void;
}) => {
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = [
    "Scolarité",
    "Contrat",
    "Stage",
    "Administratif",
    "Certification",
    "Autre",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documentName && category) {
      setIsLoading(true);
      try {
        // Simulation de la demande
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const student = mockPromotions
          .flatMap((p) => p.students)
          .find((s) => s.id === selectedStudent);

        onRequest({
          id: Date.now(),
          name: documentName,
          size: "0 ko",
          type: "PDF",
          category,
          uploadDate: "En attente",
          studentId: selectedStudent,
          studentName: student?.name,
          isRequested: true,
        });

        // Reset form
        setDocumentName("");
        setCategory("");
        onClose();
      } catch (error) {
        console.error("Erreur lors de la demande:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            Demander un document
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de l'étudiant sélectionné */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Étudiant sélectionné :</strong>{" "}
              {mockPromotions
                .flatMap((p) => p.students)
                .find((s) => s.id === selectedStudent)?.name || "N/A"}
            </p>
          </div>

          {/* Nom du document */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Nom du document à demander
            </label>
            <input
              type="text"
              placeholder="Ex: Justificatif de domicile"
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
          </div>

          {/* Catégorie du document */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Catégorie du document
            </label>
            <div className="relative">
              <div
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center justify-between px-6 py-4 border-2 border-blue-200 rounded-2xl bg-white/80 backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <span
                  className={
                    !category ? "text-blue-400" : "text-blue-900 font-medium"
                  }
                >
                  {!category ? "Sélectionner une catégorie" : category}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-blue-400 transition-transform duration-300 ${
                    categoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {categoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                    >
                      <span className="text-blue-900">{cat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton de demande */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={isLoading || !documentName || !category}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Demande en cours...
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                Demander le document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal de prévisualisation des documents
const PreviewModal = ({
  open,
  onClose,
  doc,
}: {
  open: boolean;
  onClose: () => void;
  doc: Document | null;
}) => {
  if (!open || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            Prévisualisation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-2 hover:bg-gray-200 rounded-xl"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl w-full h-[500px] flex items-center justify-center overflow-hidden border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                {doc.name}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 max-w-md mx-auto">
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-700">Catégorie</p>
                  <p>{doc.category}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-700">Taille</p>
                  <p>{doc.size}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-700">Type</p>
                  <p>{doc.type}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-700">Date</p>
                  <p>{doc.uploadDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const DocumentsPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [adminDocuments, setAdminDocuments] = useState<Document[]>([]);
  const [studentUploads, setStudentUploads] = useState<Document[]>([]);

  // Hooks pour la partie admin
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentDocuments, setStudentDocuments] = useState<Document[]>([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Refs et états pour les dropdowns modernes
  const promotionDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const profileData = await getUserProfileData(userId);
        setUserRole(profileData.roles_user);
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        setUserRole("student");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promotionDropdownRef.current &&
        !promotionDropdownRef.current.contains(event.target as Node)
      ) {
        setPromotionDropdownOpen(false);
      }
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target as Node)
      ) {
        setStudentDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gérer l'upload de documents (Admin)
  const handleUploadDocument = (doc: Document) => {
    setAdminDocuments((prev) => [doc, ...prev]);
  };

  // Gérer l'upload de documents par les étudiants
  const handleStudentUpload = (file: File, docId: number) => {
    const requestedDoc = requestedDocuments.find((d) => d.id === docId);
    if (requestedDoc) {
      const newDoc: Document = {
        ...requestedDoc,
        id: Date.now(),
        size: `${Math.round(file.size / 1024)} ko`,
        type: file.name.split(".").pop()?.toUpperCase() || "PDF",
        uploadDate: new Date().toLocaleDateString("fr-FR"),
        isRequested: false,
      };
      setStudentUploads((prev) => [newDoc, ...prev]);

      // Retirer le document de la liste des demandes
      const index = requestedDocuments.findIndex((d) => d.id === docId);
      if (index > -1) {
        requestedDocuments.splice(index, 1);
      }
    }
  };

  // Filtrer les documents
  const categories = [
    "Tous",
    "Scolarité",
    "Contrat",
    "Stage",
    "Administratif",
    "Certification",
    "Autre",
  ];

  const allStudentDocuments = [...studentDocuments, ...studentUploads];
  const filteredDocuments = (
    userRole === "student" ? allStudentDocuments : adminDocuments
  ).filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "Tous" || doc.category === selectedCategory)
  );

  if (isLoading) {
    return <AdminLoading message="Chargement des documents..." />;
  }

  // Page pour les étudiants
  if (userRole === "student") {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        <Header
          title="Mes Documents"
          description="Consultez tous vos documents personnels"
        />

        <div className="flex-1 p-0 pr-0 flex flex-col">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
            <div className="flex-1 sm:max-w-md">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div className="relative" ref={categoryDropdownRef}>
              <div
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center justify-between px-6 py-4 border-2 border-blue-200 rounded-2xl bg-white backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <span
                  className={
                    selectedCategory === "Tous"
                      ? "text-blue-400"
                      : "text-blue-900 font-medium"
                  }
                >
                  {selectedCategory === "Tous"
                    ? "Toutes les catégories"
                    : selectedCategory}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-blue-400 transition-transform duration-300 ${
                    categoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {categoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                    >
                      <span className="text-blue-900">{cat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section Documents demandés par l'admin */}
          {requestedDocuments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                Documents demandés par l'administration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requestedDocuments.map((doc) => (
                  <StudentDropZone
                    key={doc.id}
                    onUpload={handleStudentUpload}
                    requestedDoc={doc}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Liste des documents */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Mes Documents ({filteredDocuments.length})
            </h2>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <p className="text-black text-xl font-medium">
                  Aucun document trouvé
                </p>
                <p className="text-black/80 text-sm mt-2">
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:from-blue-50 hover:to-blue-100/50 hover:shadow-lg hover:-translate-y-1 border border-gray-200 hover:border-blue-200"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 font-bold text-lg group-hover:text-blue-600 transition-colors truncate">
                          {doc.name}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm mt-2">
                          <span className="bg-white px-3 py-1 rounded-xl border border-gray-200 font-medium">
                            {doc.size}
                          </span>
                          <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-xl font-medium">
                            {doc.category}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl">
                            {doc.uploadDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-blue-600 text-sm font-bold w-16 text-right group-hover:text-blue-700 transition-colors">
                        {doc.type}
                      </div>
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: download logic
                        }}
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Télécharger</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <PreviewModal
          open={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          doc={selectedDoc}
        />
      </div>
    );
  }

  // Page pour les admins
  if (userRole === "admin") {
    // Fonction pour gérer l'upload de documents pour l'étudiant sélectionné
    const handleAdminUploadDocument = (doc: Document) => {
      setStudentDocuments((prev: Document[]) => [doc, ...prev]);
    };

    // Fonction pour gérer la demande de document
    const handleRequestDocument = (doc: Document) => {
      setStudentDocuments((prev: Document[]) => [doc, ...prev]);
      // Ajouter aussi aux documents demandés globaux pour l'affichage étudiant
      requestedDocuments.push(doc);
    };

    // Filtrer les documents de l'étudiant sélectionné
    const filteredStudentDocuments = studentDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategory === "Tous" || doc.category === selectedCategory)
    );

    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        <Header
          title="Gestion des Documents"
          description="Sélectionnez un étudiant pour gérer ses documents"
        />

        <div className="flex-1 p-0 pr-0 flex flex-col">
          {/* Sélection de l'étudiant */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Sélectionner un étudiant
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection de la promotion */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Promotion
                </label>
                <div className="relative" ref={promotionDropdownRef}>
                  <div
                    onClick={() =>
                      setPromotionDropdownOpen(!promotionDropdownOpen)
                    }
                    className="flex items-center justify-between px-6 py-4 border-2 border-blue-200 rounded-2xl bg-white/80 backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <span
                      className={
                        !selectedPromotion
                          ? "text-blue-400"
                          : "text-blue-900 font-medium"
                      }
                    >
                      {!selectedPromotion
                        ? "Sélectionner une promotion"
                        : mockPromotions.find((p) => p.id === selectedPromotion)
                            ?.name}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-blue-400 transition-transform duration-300 ${
                        promotionDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {promotionDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {mockPromotions.map((promo) => (
                        <div
                          key={promo.id}
                          onClick={() => {
                            setSelectedPromotion(promo.id);
                            setSelectedStudent(""); // Reset student selection
                            setPromotionDropdownOpen(false);
                          }}
                          className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                        >
                          <span className="text-blue-900">{promo.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sélection de l'étudiant */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Étudiant
                </label>
                <div className="relative" ref={studentDropdownRef}>
                  <div
                    onClick={() =>
                      !selectedPromotion
                        ? null
                        : setStudentDropdownOpen(!studentDropdownOpen)
                    }
                    className={`flex items-center justify-between px-6 py-4 border-2 rounded-2xl bg-white/80 backdrop-blur-sm text-blue-900 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      !selectedPromotion
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-blue-200 hover:border-blue-300 cursor-pointer"
                    }`}
                  >
                    <span
                      className={
                        !selectedStudent
                          ? "text-blue-400"
                          : "text-blue-900 font-medium"
                      }
                    >
                      {!selectedStudent
                        ? "Sélectionner un étudiant"
                        : mockPromotions
                            .flatMap((p) => p.students)
                            .find((s) => s.id === selectedStudent)?.name}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-blue-400 transition-transform duration-300 ${
                        studentDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {studentDropdownOpen && selectedPromotion && (
                    <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {mockPromotions
                        .find((p) => p.id === selectedPromotion)
                        ?.students.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => {
                              setSelectedStudent(student.id);
                              setStudentDropdownOpen(false);
                            }}
                            className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                          >
                            <span className="text-blue-900">
                              {student.name} - {student.email}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Affichage des documents de l'étudiant sélectionné */}
          {selectedStudent && (
            <>
              {/* Barre d'actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
                <div className="flex-1 sm:max-w-md">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Rechercher un document..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Upload className="w-5 h-5" />
                    Uploader un document
                  </button>

                  <button
                    className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => setRequestModalOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Demander un document
                  </button>
                </div>
              </div>

              {/* Filtre par catégorie */}
              <div className="mb-6">
                <div className="relative" ref={categoryDropdownRef}>
                  <div
                    onClick={() =>
                      setCategoryDropdownOpen(!categoryDropdownOpen)
                    }
                    className="flex  justify-between px-6 py-3 border-2 border-blue-200 rounded-2xl bg-white backdrop-blur-sm text-blue-900 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] items-start w-fit"
                  >
                    <span
                      className={
                        selectedCategory === "Tous"
                          ? "text-blue-400"
                          : "text-blue-900 font-medium"
                      }
                    >
                      {selectedCategory === "Tous"
                        ? "Toutes les catégories"
                        : selectedCategory}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-blue-400 transition-transform duration-300 ${
                        categoryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {categoryDropdownOpen && (
                    <div className="absolute z-10 w-fit mt-2 bg-white/95 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto ">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCategoryDropdownOpen(false);
                          }}
                          className="px-4 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0 last:rounded-b-xl"
                        >
                          <span className="text-blue-900">{cat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Liste des documents de l'étudiant */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Documents de l'étudiant ({filteredStudentDocuments.length})
                </h2>

                {filteredStudentDocuments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-500 text-xl font-medium">
                      Aucun document trouvé
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Commencez par uploader un document ou en demander un
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="group relative bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:from-blue-50 hover:to-blue-100/50 hover:shadow-lg hover:-translate-y-1 border border-gray-200 hover:border-blue-200"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-800 font-bold text-lg group-hover:text-blue-600 transition-colors truncate">
                              {doc.name}
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm mt-2">
                              <span className="bg-white px-3 py-1 rounded-xl border border-gray-200 font-medium">
                                {doc.size}
                              </span>
                              <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-xl font-medium">
                                {doc.category}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl">
                                {doc.uploadDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-blue-600 text-sm font-bold w-16 text-right group-hover:text-blue-700 transition-colors">
                            {doc.type}
                          </div>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: download logic
                            }}
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Télécharger
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Message si aucun étudiant sélectionné */}
          {!selectedStudent && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-xl font-medium">
                Sélectionnez un étudiant
              </p>
              <p className="text-white/80 text-sm mt-2">
                Choisissez une promotion puis un étudiant pour commencer
              </p>
            </div>
          )}
        </div>

        <AdminUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleAdminUploadDocument}
          selectedStudent={selectedStudent}
        />

        <RequestDocumentModal
          open={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          selectedStudent={selectedStudent}
          onRequest={handleRequestDocument}
        />

        <PreviewModal
          open={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          doc={selectedDoc}
        />
      </div>
    );
  }

  // Rôle non reconnu
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <Header
        title="Accès Refusé"
        description="Vous n'avez pas les permissions nécessaires"
      />
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Rôle utilisateur non reconnu</p>
      </div>
    </div>
  );
};

export default DocumentsPage;
