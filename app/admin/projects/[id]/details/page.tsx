"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import MainCard from "@/components/Projects/Details/MainCard/MainCard";
import {
  ArrowLeft,
  Download,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectResources } from "@/lib/projectData";
import { useProjectsData } from "@/hooks/useProjectsData";
import AdminLoading from "@/components/admin/AdminLoading";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

export default function AdminProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";

  const { fetchAllProjects, projects, loading, error } = useProjectsData();

  const [resourcesData, setResourcesData] = useState<{
    project_name: string;
    description: string;
    resources: { filename: string; url: string; uploaded_at: string }[];
    resources_count: number;
  } | null>(null);

  // Étudiants assignés au projet (via service project-students) et tous étudiants pour dropdown
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [advisorComment, setAdvisorComment] = useState<string>("");
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAllProjects();
    // Dépendances vides pour éviter les rafraîchissements en boucle si la référence change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getProjectResources(projectId);
        setResourcesData(data);
      } catch (e) {
        // noop: fallback déjà géré par getProjectResources
      }
    };
    if (projectId) fetchResources();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Récupérer assignations et étudiants (selon la promotion du projet)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError(null);

        // Étudiants assignés à ce projet
        const assignmentsRes = await fetch(
          `http://localhost:3003/project-students/project/${projectId}`
        );
        const assignmentsJson = assignmentsRes.ok
          ? await assignmentsRes.json()
          : { success: false, data: [] };
        const assignments = assignmentsJson.success ? assignmentsJson.data : [];
        setAssignedStudents(assignments);

        // Étudiants de la promotion du projet (avec profil)
        const cp: any =
          projects.find((p: any) => String(p.id) === String(projectId)) || {};
        if (cp?.id_promotion) {
          const studentsRes = await fetch(
            `http://localhost:3004/students/promotion/${cp.id_promotion}`
          );
          const studentsJson = studentsRes.ok
            ? await studentsRes.json()
            : { success: false, data: [] };
          const students = studentsJson.success ? studentsJson.data : [];
          setAllStudents(students);
        } else {
          setAllStudents([]);
        }

        // Pré-sélectionner le premier étudiant assigné si dispo
        if (assignments.length > 0) {
          setSelectedStudent(String(assignments[0].id_student));
          setSelectedAssignmentId(String(assignments[0].id));
          setAdvisorComment(assignments[0].advisor_comment || "");
        }
      } catch (e: any) {
        setStudentsError(e?.message || "Erreur inconnue");
      } finally {
        setStudentsLoading(false);
      }
    };
    if (projectId) fetchStudents();
    // Dépend de projects et projectId (pas de currentProject pour éviter l’usage avant déclaration)
  }, [projectId, projects]);

  const currentProject = useMemo(() => {
    return projects.find((p: any) => String(p.id) === String(projectId));
  }, [projects, projectId]);

  // Détails mock/compat si backend ne fournit pas tout
  const generalInfo = useMemo(() => {
    const cp: any = currentProject || {};
    return {
      startDate: cp?.details?.startDate
        ? new Date(cp.details.startDate).toLocaleDateString("fr-FR")
        : currentProject?.created_at
        ? new Date(currentProject.created_at).toLocaleDateString("fr-FR")
        : "-",
      endDate: cp?.details?.endDate
        ? new Date(cp.details.endDate).toLocaleDateString("fr-FR")
        : currentProject?.created_at
        ? new Date(
            new Date(currentProject.created_at).getTime() +
              30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("fr-FR")
        : "-",
      team:
        cp?.details?.team ||
        (Array.isArray(cp?.students)
          ? cp.students
              .map((s: any) => `${s.first_name} ${s.last_name}`)
              .join(", ")
          : "-"),
      deadline: {
        kickOff: cp?.deadline?.kickOff
          ? new Date(cp.deadline.kickOff).toLocaleDateString("fr-FR")
          : currentProject?.created_at
          ? new Date(currentProject.created_at).toLocaleDateString("fr-FR")
          : "-",
        followUp: cp?.deadline?.followUp
          ? new Date(cp.deadline.followUp).toLocaleDateString("fr-FR")
          : currentProject?.created_at
          ? new Date(
              new Date(currentProject.created_at).getTime() +
                15 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("fr-FR")
          : "-",
        keynote: cp?.deadline?.keynote
          ? new Date(cp.deadline.keynote).toLocaleDateString("fr-FR")
          : currentProject?.created_at
          ? new Date(
              new Date(currentProject.created_at).getTime() +
                30 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("fr-FR")
          : "-",
      },
    };
  }, [currentProject]);

  if (loading) return <AdminLoading message="Chargement..." />;

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-8">
        <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => router.push("/admin/projects")}>
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <ProjectHeader
        title={
          resourcesData?.project_name ||
          currentProject?.name ||
          "Détails du projet"
        }
        description="Vue administrateur - sélection d’un étudiant"
        backIcon={<ArrowLeft className="w-4 h-4" />}
      />

      {/* Sélection étudiant */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200/50 mb-12 max-w-xl">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          Sélectionner un étudiant
        </h3>
        <div className="relative max-w-xl mx-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 transition-all duration-300 hover:border-blue-400 hover:shadow-md flex items-center justify-between cursor-pointer"
            disabled={studentsLoading}
          >
            <span
              className={!selectedStudent ? "text-blue-400" : "text-blue-900"}
            >
              {studentsLoading
                ? "Chargement des étudiants..."
                : selectedStudent
                ? (() => {
                    const found = allStudents.find(
                      (s) => String(s.id) === String(selectedStudent)
                    );
                    const label = found?.profile
                      ? `${found.profile.first_name} ${found.profile.last_name}`
                      : found?.first_name && found?.last_name
                      ? `${found.first_name} ${found.last_name}`
                      : `Étudiant #${selectedStudent}`;
                    return label;
                  })()
                : "Choisir un étudiant"}
            </span>
            <ChevronDown
              size={20}
              className={`text-blue-400 transition-transform duration-300 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && !studentsLoading && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
              {assignedStudents.length > 0 && (
                <div className="px-4 py-2 text-xs text-blue-700 bg-blue-50 border-b border-blue-100">
                  Étudiants assignés
                </div>
              )}
              {assignedStudents.map((as) => (
                <button
                  key={as.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(String(as.id_student));
                    setSelectedAssignmentId(String(as.id));
                    setAdvisorComment(as.advisor_comment || "");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-300 cursor-pointer border-b border-blue-100 last:border-b-0"
                >
                  {(() => {
                    const s = allStudents.find(
                      (st) => String(st.id) === String(as.id_student)
                    );
                    return s?.profile
                      ? `${s.profile.first_name} ${s.profile.last_name}`
                      : s?.first_name && s?.last_name
                      ? `${s.first_name} ${s.last_name}`
                      : `Étudiant #${as.id_student}`;
                  })()}
                </button>
              ))}

              <div className="px-4 py-2 text-xs text-blue-700 bg-blue-50 border-y border-blue-100">
                Tous les étudiants
              </div>
              {allStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(String(s.id));
                    const foundAssign = assignedStudents.find(
                      (a) => String(a.id_student) === String(s.id)
                    );
                    setSelectedAssignmentId(
                      foundAssign ? String(foundAssign.id) : ""
                    );
                    setAdvisorComment(foundAssign?.advisor_comment || "");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-300 cursor-pointer border-b border-blue-100 last:border-b-0"
                >
                  {s.profile
                    ? `${s.profile.first_name} ${s.profile.last_name}`
                    : s.first_name && s.last_name
                    ? `${s.first_name} ${s.last_name}`
                    : `Étudiant #${s.id}`}
                </button>
              ))}
            </div>
          )}

          {studentsError && (
            <p className="text-red-600 text-sm mt-2">{studentsError}</p>
          )}
        </div>
      </div>

      {/* Commentaire administrateur (visible après sélection d'un étudiant) */}
      {selectedStudent && (
        <div className="mt-10 mb-8">
          <MainCard
            title="Laisser un commentaire à l'étudiant"
            icon={<AlertCircle className="w-6 h-6 text-blue-500" />}
          >
            <div className="space-y-4">
              <textarea
                value={advisorComment}
                onChange={(e) => setAdvisorComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 transition-all duration-300 hover:border-blue-400 hover:shadow-md resize-none"
                placeholder="Laisser un commentaire à l'étudiant..."
              />
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    if (!selectedAssignmentId) return;
                    await fetch(
                      `http://localhost:3003/project-students/${selectedAssignmentId}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          advisor_comment: advisorComment,
                        }),
                      }
                    );
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedAssignmentId}
                >
                  {selectedAssignmentId
                    ? "Enregistrer le commentaire"
                    : "Aucune assignation - sauvegarde indisponible"}
                </Button>
              </div>
            </div>
          </MainCard>
        </div>
      )}

      {selectedStudent && (
        <>
          {/* Description */}
          <MainCard
            title="Description du projet"
            icon={<AlertCircle className="w-6 h-6 text-blue-500" />}
          >
            <p className="text-gray-700">
              {resourcesData?.description || "Aucune description disponible."}
            </p>
          </MainCard>

          {/* Ressources */}
          <div className="mt-8">
            <MainCard
              title="Ressources"
              icon={<Download className="w-6 h-6 text-blue-500" />}
            >
              {resourcesData?.resources &&
              resourcesData.resources.length > 0 ? (
                <div className="space-y-2">
                  {resourcesData.resources.map((res, idx) => (
                    <div
                      key={`${res.filename}-${idx}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {res.filename}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Ajouté le{" "}
                          {new Date(res.uploaded_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                      {res.url ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer ml-4"
                        >
                          Télécharger
                        </a>
                      ) : (
                        <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium ml-4">
                          Indisponible
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune ressource disponible
                </div>
              )}
            </MainCard>
          </div>

          {/* Infos générales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <MainCard
              title="Informations générales"
              icon={<Users className="w-6 h-6 text-blue-500" />}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-semibold text-gray-800">
                      {generalInfo.startDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-semibold text-gray-800">
                      {generalInfo.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </MainCard>
            <DevelopmentBadge>
            <MainCard
              title="Deadlines"
              icon={<Clock className="w-6 h-6 text-blue-500" />}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Kick off</p>
                  <p className="font-semibold text-gray-800">
                    {generalInfo.deadline.kickOff}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Follow up</p>
                  <p className="font-semibold text-gray-800">
                    {generalInfo.deadline.followUp}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Keynote</p>
                  <p className="font-semibold text-gray-800">
                    {generalInfo.deadline.keynote}
                  </p>
                </div>
              </div>
            </MainCard>
            </DevelopmentBadge>
          </div>

          {/* Médailles */}
          <div className="mt-8">
            <MainCard
              title="Médailles du projet"
              icon={<Users className="w-6 h-6 text-blue-500" />}
            >
              {(() => {
                const cp: any = currentProject || {};
                const medals: any[] = cp?.medals || cp?.trophies || [];
                if (!Array.isArray(medals) || medals.length === 0) {
                  return (
                    <p className="text-gray-500">Aucune médaille définie.</p>
                  );
                }
                return (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      {Array.isArray(medals)
                        ? medals.filter(
                            (m: any) => m.obtained || m.obtained === true
                          ).length
                        : 0}
                      /{medals.length}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {medals.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="font-semibold text-gray-800 truncate">
                            {m.name || m.title || `Médaille ${idx + 1}`}
                          </p>
                          {m.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {m.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </MainCard>
          </div>
        </>
      )}
    </div>
  );
}
