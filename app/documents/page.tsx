"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import BackgroundBubbles from "@/components/Background/BackgroundBubbles";
import { Search, Plus, Download, FileText, X, Eye } from "lucide-react";
import Header from "@/components/Header/Header";
import SearchBar from "@/components/SearchBar/SearchBar";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import AdminLoading from "@/components/admin/AdminLoading";

// Structure dynamique des documents
const initialDocs = {
  academique: [
    { id: 1, name: "Algèbre linéaire", size: "270 ko", type: "PDF" },
    {
      id: 2,
      name: "Introduction a la programmation",
      size: "270 ko",
      type: "DOCX",
    },
    { id: 3, name: "Syllabus de cours", size: "270 ko", type: "PDF" },
  ],
  entreprise: [
    { id: 4, name: "Algèbre linéaire", size: "270 ko", type: "PDF" },
    {
      id: 5,
      name: "Introduction a la programmation",
      size: "270 ko",
      type: "DOCX",
    },
    { id: 6, name: "Syllabus de cours", size: "270 ko", type: "PDF" },
  ],
};

const ModalAddDocument = ({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (doc: any, category: "academique" | "entreprise") => void;
}) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<"academique" | "entreprise">(
    "academique"
  );
  const [detectedType, setDetectedType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const detectType = (file: File | null) => {
    if (!file) return "";
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (ext === "docx") return "DOCX";
    if (ext === "xlsx") return "XLSX";
    return ext?.toUpperCase() || "?";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && file) {
      setIsLoading(true);
      try {
        // Simulation d'upload (à remplacer par l'appel API réel)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const type = detectType(file);
        onAdd(
          {
            id: Date.now(),
            name,
            size: `${Math.round(file.size / 1024)} ko`,
            type,
          },
          category
        );
        setName("");
        setFile(null);
        setCategory("academique");
        setDetectedType("");
        onClose();
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Ajouter un document
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Catégorie */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "academique" | "entreprise")
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="academique">Ressources académiques</option>
              <option value="entreprise">Documents liés à l'entreprise</option>
            </select>
          </div>

          {/* Nom du document */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom du document
            </label>
            <input
              type="text"
              placeholder="Ex: Syllabus de cours"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Fichier */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fichier
            </label>
            <div className="relative">
              <input
                type="file"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setDetectedType(detectType(f));
                }}
                required
              />
            </div>
            {file && (
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-xl">
                Type détecté :{" "}
                <span className="font-semibold text-blue-700">
                  {detectedType}
                </span>
              </div>
            )}
          </div>

          {/* Bouton d'ajout */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || !name || !file}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Ajouter le document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const ModalAllDocuments = ({
  open,
  onClose,
  documents,
  title,
}: {
  open: boolean;
  onClose: () => void;
  documents: any[];
  title: string;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 bg-gray-50 rounded-xl px-6 py-4 border border-gray-200 hover:bg-gray-100 transition-all duration-200"
            >
              <div className="bg-blue-600 rounded-xl p-3 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-gray-800 font-semibold text-lg">
                  {doc.name}
                </div>
                <div className="text-gray-500 text-sm">{doc.size}</div>
              </div>
              <div className="text-blue-600 text-sm font-medium w-16 text-right">
                {doc.type}
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); /* TODO: download logic */
                }}
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DocumentsPage = () => {
  const [docs, setDocs] = useState(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isClosingPreview, setIsClosingPreview] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalAllOpen, setModalAllOpen] = useState<
    null | "academique" | "entreprise"
  >(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour fermer la prévisualisation avec animation
  const closePreview = () => {
    setIsClosingPreview(true);
    setTimeout(() => {
      setSelectedDoc(null);
      setIsClosingPreview(false);
    }, 300);
  };

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          setIsLoading(false);
          return;
        }

        // Récupérer le profil utilisateur pour obtenir le rôle
        const profileData = await getUserProfileData(userId);
        setUserRole(profileData.roles_user);
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        // En cas d'erreur, on considère comme étudiant par défaut
        setUserRole("student");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Vérifier si l'utilisateur peut ajouter des documents
  const canAddDocuments = userRole === "admin" || userRole === "advisor";

  // Filtrage simple (à améliorer selon besoins)
  const filteredAcademique = docs.academique.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredEntreprise = docs.entreprise.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDocument = (
    doc: any,
    category: "academique" | "entreprise"
  ) => {
    setDocs((prev) => ({
      ...prev,
      [category]: [doc, ...prev[category]],
    }));
  };

  if (isLoading) {
    return <AdminLoading message="Chargement des documents..." />;
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <Header
        title="Documents"
        description="Gérez et retrouvez tous vos fichiers"
      />

      <div className="flex h-full">
        {/* Colonne principale */}
        <div className="flex-1 p-0 pr-0 flex flex-col">
          {/* Barre de recherche modernisée + bouton ajouter */}
          <div className="flex flex-row items-center justify-between mb-8 gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            {canAddDocuments && (
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-8 overflow-y-auto">
            {/* Section Ressources académiques */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Ressources académiques
                </h2>
                <button
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 text-sm rounded-xl px-4 py-2 font-semibold cursor-pointer"
                  onClick={() => setModalAllOpen("academique")}
                >
                  Voir plus
                </button>
              </div>
              <div className="space-y-4">
                {filteredAcademique.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 bg-gray-50 rounded-xl px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 group border border-gray-200"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="bg-blue-600 rounded-xl p-3 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </div>
                      <div className="text-gray-500 text-sm">{doc.size}</div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium w-16 text-right group-hover:text-blue-700 transition-colors">
                      {doc.type}
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); /* TODO: download logic */
                      }}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Documents liés à l'entreprise */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Documents liés à l'entreprise
                </h2>
                <button
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 text-sm rounded-xl px-4 py-2 font-semibold"
                  onClick={() => setModalAllOpen("entreprise")}
                >
                  Voir plus
                </button>
              </div>
              <div className="space-y-4">
                {filteredEntreprise.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 bg-gray-50 rounded-xl px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 group border border-gray-200"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="bg-blue-600 rounded-xl p-3 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </div>
                      <div className="text-gray-500 text-sm">{doc.size}</div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium w-16 text-right group-hover:text-blue-700 transition-colors">
                      {doc.type}
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation(); /* TODO: download logic */
                      }}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne prévisualisation */}
        {(selectedDoc || isClosingPreview) && (
          <div
            className={`w-[420px] bg-white rounded-2xl ml-6 p-6 border border-gray-200 ${
              isClosingPreview
                ? "animate-out slide-out-to-right duration-300 ease-in"
                : "animate-in slide-in-from-right duration-300 ease-out"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                Prévisualisation
              </h2>
              <button
                className="text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                onClick={closePreview}
                title="Fermer la prévisualisation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div
              className={`bg-gray-50 rounded-xl w-full h-[500px] flex items-center justify-center overflow-hidden border border-gray-200 ${
                isClosingPreview
                  ? "animate-out fade-out duration-300 ease-in"
                  : "animate-in fade-in duration-500 ease-out delay-150"
              }`}
            >
              <div className="text-center">
                <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <span className="text-gray-600 text-lg font-semibold">
                  Aperçu du document : {selectedDoc?.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalAddDocument
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddDocument}
      />
      <ModalAllDocuments
        open={modalAllOpen === "academique"}
        onClose={() => setModalAllOpen(null)}
        documents={docs.academique}
        title="Tous les documents académiques"
      />
      <ModalAllDocuments
        open={modalAllOpen === "entreprise"}
        onClose={() => setModalAllOpen(null)}
        documents={docs.entreprise}
        title="Tous les documents liés à l'entreprise"
      />
    </div>
  );
};

export default DocumentsPage;
