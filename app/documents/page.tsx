"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import BackgroundBubbles from "@/components/Background/BackgroundBubbles";
import { Search } from "lucide-react";

// Structure dynamique des documents
const initialDocs = {
  academique: [
    { id: 1, name: "Algèbre linéaire", size: "270 ko", type: "PDF" },
    { id: 2, name: "Introduction a la programmation", size: "270 ko", type: "DOCX" },
    { id: 3, name: "Syllabus de cours", size: "270 ko", type: "PDF" },
  ],
  entreprise: [
    { id: 4, name: "Algèbre linéaire", size: "270 ko", type: "PDF" },
    { id: 5, name: "Introduction a la programmation", size: "270 ko", type: "DOCX" },
    { id: 6, name: "Syllabus de cours", size: "270 ko", type: "PDF" },
  ],
};

const ModalAddDocument = ({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (doc: any, category: "academique" | "entreprise") => void }) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<"academique" | "entreprise">("academique");
  const [detectedType, setDetectedType] = useState("");

  const detectType = (file: File | null) => {
    if (!file) return "";
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (ext === "docx") return "DOCX";
    if (ext === "xlsx") return "XLSX";
    return ext?.toUpperCase() || "?";
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Ajouter un document</h2>
        <form className="flex flex-col gap-4" onSubmit={e => {
          e.preventDefault();
          if (name && file) {
            const type = detectType(file);
            onAdd({
              id: Date.now(),
              name,
              size: `${Math.round(file.size / 1024)} ko`,
              type,
            }, category);
            setName("");
            setFile(null);
            setCategory("academique");
            setDetectedType("");
            onClose();
          }
        }}>
          <select value={category} onChange={e => setCategory(e.target.value as "academique" | "entreprise")} className="border rounded px-3 py-2">
            <option value="academique">Ressources académiques</option>
            <option value="entreprise">Documents liés à l'entreprise</option>
          </select>
          <input type="text" placeholder="Nom du document" className="border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
          <input type="file" className="border rounded px-3 py-2" onChange={e => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            setDetectedType(detectType(f));
          }} />
          {file && (
            <div className="text-sm text-gray-500">Type détecté : <span className="font-bold">{detectedType}</span></div>
          )}
          <button type="submit" className="bg-[#1971FF] text-white rounded px-4 py-2 font-semibold hover:bg-[#1450b8]">Ajouter</button>
        </form>
      </div>
    </div>
  );
};

const ModalAllDocuments = ({ open, onClose, documents, title }: { open: boolean; onClose: () => void; documents: any[]; title: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-[#1971FF] mb-6">{title}</h2>
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 bg-[#f3f6fd] rounded-xl px-6 py-4 border border-[#e6f0ff]">
              <span className="bg-[#1971FF] rounded-xl p-3 flex items-center justify-center"><svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8M8 12h8M8 16h2"/></svg></span>
              <div className="flex-1">
                <div className="text-[#2563eb] font-semibold text-lg">{doc.name}</div>
                <div className="text-[#b3cfff] text-xs">{doc.size}</div>
              </div>
              <div className="text-[#1971FF] text-xs w-16 text-right">{doc.type}</div>
              <button
                className="ml-2 px-3 py-1 rounded-lg bg-[#1971FF]/80 text-white text-sm font-semibold hover:bg-[#1450b8] transition-colors flex items-center gap-1"
                onClick={e => { e.stopPropagation(); /* TODO: download logic */ }}
                title="Télécharger"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalAllOpen, setModalAllOpen] = useState<null | "academique" | "entreprise">(null);

  // Filtrage simple (à améliorer selon besoins)
  const filteredAcademique = docs.academique.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  const filteredEntreprise = docs.entreprise.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddDocument = (doc: any, category: "academique" | "entreprise") => {
    setDocs(prev => ({
      ...prev,
      [category]: [doc, ...prev[category]],
    }));
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="flex h-full">
          {/* Colonne principale */}
          <div className="flex-1 p-12 pr-0 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-extrabold text-white" style={{fontFamily: 'Russo One, sans-serif'}}>Documents</h1>
              <button
                className="bg-[#3b82f6] text-white px-8 py-2 rounded-xl font-bold text-lg shadow hover:bg-[#1971FF] hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1971FF]"
                style={{boxShadow: '0 2px 8px #1971ff22'}}
                onClick={() => setModalOpen(true)}
              >
                Ajouter
              </button>
            </div>
            {/* Barre de recherche modernisée */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  className="w-full pl-12 pr-4 py-3 border-0 bg-white rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-[#1971FF] transition-all duration-300 text-[#2563eb] placeholder:text-gray-400 text-base"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-10 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">Ressources académique</h2>
                  <button className="text-[#b3cfff] hover:bg-[#3b82f6]/40 hover:text-white transition-colors text-sm rounded px-3 py-1 font-semibold" onClick={() => setModalAllOpen("academique")}>Voir plus</button>
                </div>
                <div className="flex flex-col gap-4">
                  {filteredAcademique.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 cursor-pointer transition-all duration-150 hover:bg-[#e6f0ff] hover:shadow-xl group border border-[#e6f0ff]" onClick={() => setSelectedDoc(doc)} style={{boxShadow: '0 2px 8px #1971ff11'}}>
                      <span className="bg-[#1971FF] rounded-xl p-3 flex items-center justify-center"><svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8M8 12h8M8 16h2"/></svg></span>
                      <div className="flex-1">
                        <div className="text-[#2563eb] font-semibold text-lg group-hover:text-[#1971FF]">{doc.name}</div>
                        <div className="text-[#b3cfff] text-xs">{doc.size}</div>
                      </div>
                      <div className="text-[#1971FF] text-xs w-16 text-right group-hover:text-[#2563eb]">{doc.type}</div>
                      <button
                        className="ml-2 px-3 py-1 rounded-lg bg-[#1971FF]/80 text-white text-sm font-semibold hover:bg-[#1450b8] transition-colors flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); /* TODO: download logic */ }}
                        title="Télécharger"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">Documents liés à l'entreprise</h2>
                  <button className="text-[#b3cfff] hover:bg-[#3b82f6]/40 hover:text-white transition-colors text-sm rounded px-3 py-1 font-semibold" onClick={() => setModalAllOpen("entreprise")}>Voir plus</button>
                </div>
                <div className="flex flex-col gap-4">
                  {filteredEntreprise.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 cursor-pointer transition-all duration-150 hover:bg-[#e6f0ff] hover:shadow-xl group border border-[#e6f0ff]" onClick={() => setSelectedDoc(doc)} style={{boxShadow: '0 2px 8px #1971ff11'}}>
                      <span className="bg-[#1971FF] rounded-xl p-3 flex items-center justify-center"><svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8M8 12h8M8 16h2"/></svg></span>
                      <div className="flex-1">
                        <div className="text-[#2563eb] font-semibold text-lg group-hover:text-[#1971FF]">{doc.name}</div>
                        <div className="text-[#b3cfff] text-xs">{doc.size}</div>
                      </div>
                      <div className="text-[#1971FF] text-xs w-16 text-right group-hover:text-[#2563eb]">{doc.type}</div>
                      <button
                        className="ml-2 px-3 py-1 rounded-lg bg-[#1971FF]/80 text-white text-sm font-semibold hover:bg-[#1450b8] transition-colors flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); /* TODO: download logic */ }}
                        title="Télécharger"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Colonne prévisualisation */}
          {selectedDoc && (
            <div className="w-[420px] bg-[#2563eb] flex flex-col items-center pt-10 pl-6">
              <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Prévisualisation</h2>
                <button
                  className="text-[#1971FF] bg-white rounded-full p-1 shadow hover:bg-[#e6f0ff] transition-colors"
                  onClick={() => setSelectedDoc(null)}
                  title="Fermer la prévisualisation"
                >
                  <svg width="22" height="22" fill="none" stroke="#1971FF" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl w-full h-[500px] flex items-center justify-center overflow-hidden" style={{boxShadow: '0 4px 24px #1971ff22'}}>
                <span className="text-[#1971FF] text-lg font-bold">Aperçu du document : {selectedDoc?.name}</span>
              </div>
            </div>
          )}
        </div>
        <ModalAddDocument open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddDocument} />
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
    </div>
  );
};

export default DocumentsPage; 