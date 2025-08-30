  "use client";

  import React, { useState, useMemo, useRef, useEffect } from "react";
  import Header from "@/components/Header/Header";
  import { Button } from "@/components/ui/button";
  import Cards from "@/components/Projects/Cards";
  import { useProjectsData } from "@/hooks/useProjectsData";
  import { useRouter } from "next/navigation";
  import {
    Filter,
    Users,
    GraduationCap,
    Plus,
    Loader2,
    AlertCircle,
    RefreshCw,
    Search,
    X,
    FileText,
    CheckSquare,
    ChevronDown,
  } from "lucide-react";
  import { useUserData } from "@/hooks/useUserData";
  import { getUserIdFromToken } from "@/lib/auth";
  import AdminButton from "@/components/admin/buttons/AdminButton";
  import AdminFilterBar from "@/components/admin/AdminFilterBar";
  import AdminLoading from "@/components/admin/AdminLoading";
  import AdminStatsCards, {
    createProjectsStats,
  } from "@/components/admin/AdminStatsCards";
  import usePromotionsData from "@/hooks/usePromotionsData";

  // Pour filtrer par promo et étudiant
  interface Project {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    details?: {
      startDate: string;
      endDate: string;
      team: string;
    };
    deadline?: {
      kickOff: string;
      followUp: string;
      keynote: string;
    };
    documentation?: {
      pdfUrl: string;
      pdfName: string;
    };
    medals?: Array<{
      name: string;
      description: string;
    }>;
    resources?: Array<{
      name: string;
      url: string;
      description: string;
      category: string;
    }>;
    hotTopics?: string;
    skills?: string;
    ressources: Array<{
      filename: string;
      url: string;
      description?: string;
      uploaded_at: string;
    }>;
    is_active: boolean;
    id_creator: string;
    created_at: string;
    updated_at: string;
    students?: any[];
    promotion?: string;
  }

  export default function AdminProjectsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPromotion, setSelectedPromotion] = useState<string>("all");
    const [selectedStudent, setSelectedStudent] = useState<string>("all");
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(8);

    const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
    const promotionDropdownRef = useRef<HTMLDivElement | null>(null);
    const studentDropdownRef = useRef<HTMLDivElement | null>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Récupérer tous les projets
    const { projects, loading, error, fetchAllProjects } = useProjectsData();

    // Récupérer le rôle de l'utilisateur connecté
    const { userData: currentUser, loading: userLoading } = useUserData(
      getUserIdFromToken()
    );

    // Hook pour récupérer les promotions
    const {
      promotions: apiPromotions,
      loading: promotionsLoading,
      error: promotionsError,
    } = usePromotionsData();

    // État pour les utilisateurs
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);

    // Fonction pour récupérer tous les utilisateurs
    const fetchAllUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // Récupérer tous les profils utilisateurs
        const profilesResponse = await fetch("http://localhost:3004/profiles");
        if (!profilesResponse.ok) {
          throw new Error("Erreur lors de la récupération des profils");
        }
        const profilesData = await profilesResponse.json();

        if (!profilesData.success) {
          throw new Error(profilesData.message || "Erreur serveur");
        }

        // Récupérer tous les étudiants
        const studentsResponse = await fetch("http://localhost:3004/students");
        const studentsData = studentsResponse.ok
          ? await studentsResponse.json()
          : { success: false, data: [] };

        // Récupérer tous les utilisateurs pour avoir les emails
        const usersResponse = await fetch("http://localhost:3001/users");
        const usersData = usersResponse.ok
          ? await usersResponse.json()
          : { success: false, data: [] };

        console.log("Données des étudiants brutes:", studentsData);

        // Combiner les données
        const usersWithDetails = profilesData.data.map((profile: any) => {
          const student = studentsData.success
            ? studentsData.data.find((s: any) => s.id_user_profile === profile.id)
            : null;

          // Récupérer l'email depuis la table user
          const user = usersData.success
            ? usersData.data.find((u: any) => u.id === profile.id_user)
            : null;

          return {
            id: profile.id,
            id_user: profile.id_user,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: user ? user.email : profile.email,
            phone: profile.phone,
            address: profile.address,
            campus: profile.campus,
            roles_user: profile.roles_user,
            profileImage: profile.profileImage,
            ...(student && { student }),
          };
        });

        console.log("Données des utilisateurs récupérées:", usersWithDetails);
        const studentsFound = usersWithDetails.filter(
          (u: any) => u.roles_user === "student"
        );
        console.log("Étudiants trouvés:", studentsFound);
        console.log("Détails des étudiants avec leurs promotions:");
        studentsFound.forEach((student: any) => {
          console.log(
            `- ${student.first_name} ${student.last_name}: promotion = ${student.student?.promotion}, student object =`,
            student.student
          );
        });
        setAllUsers(usersWithDetails);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        setUsersError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setUsersLoading(false);
      }
    };

    useEffect(() => {
      fetchAllProjects();
      fetchAllUsers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Utiliser les promotions du backend
    const promotions = useMemo(() => {
      if (!apiPromotions || promotionsLoading) {
        // Fallback vers les promotions des projets si pas de données API
        const promoSet = new Set<string>();
        projects.forEach((project: any) => {
          if (project.promotion) {
            promoSet.add(project.promotion);
          }
        });
        return Array.from(promoSet).sort();
      }

      // Utiliser toutes les promotions de l'API
      return apiPromotions.map((promo) => promo.name).sort();
    }, [apiPromotions, promotionsLoading, projects]);

    // Utiliser les étudiants du backend
    const students = useMemo(() => {
      if (usersLoading || usersError) {
        // Fallback vers les étudiants des projets si pas de données API
        const studentSet = new Set<string>();
        projects.forEach((project: any) => {
          if (project.students && Array.isArray(project.students)) {
            project.students.forEach((student: any) => {
              if (student.first_name && student.last_name) {
                studentSet.add(`${student.first_name} ${student.last_name}`);
              }
            });
          }
        });
        return Array.from(studentSet).sort();
      }

      // Filtrer les étudiants par promotion si une promotion est sélectionnée
      let filteredStudents = allUsers.filter(
        (user) => user.roles_user === "student"
      );

      console.log(`Total étudiants avant filtrage: ${filteredStudents.length}`);
      console.log(`Promotion sélectionnée: "${selectedPromotion}"`);

      if (selectedPromotion !== "all") {
        // Filtrer par promotion
        filteredStudents = filteredStudents.filter((user) => {
          // Vérifier si l'étudiant a une promotion qui correspond
          let studentPromotion = user.student?.promotion;

          // Si pas de promotion assignée, utiliser une promotion par défaut pour les tests
          if (!studentPromotion) {
            // Assigner MSC2027 aux premiers étudiants pour tester
            const studentIndex = allUsers.findIndex((u) => u.id === user.id);
            if (studentIndex < 2) {
              studentPromotion = "MSC2027";
              console.log(
                `Promotion temporaire assignée à ${user.first_name} ${user.last_name}: MSC2027`
              );
            }
          }

          const normalizedStudentPromotion = studentPromotion
            ?.toLowerCase()
            .trim();
          const normalizedSelectedPromotion = selectedPromotion
            .toLowerCase()
            .trim();

          console.log(
            `Étudiant ${user.first_name} ${user.last_name}: promotion = "${studentPromotion}" -> "${normalizedStudentPromotion}", selected = "${selectedPromotion}" -> "${normalizedSelectedPromotion}"`
          );

          const matches =
            normalizedStudentPromotion === normalizedSelectedPromotion;
          console.log(`Match: ${matches}`);

          return matches;
        });
      }

      const studentsFromAPI = filteredStudents
        .map((user) => `${user.first_name} ${user.last_name}`)
        .sort();

      console.log(`Promotion sélectionnée: ${selectedPromotion}`);
      console.log(`Étudiants filtrés:`, studentsFromAPI);
      return studentsFromAPI;
    }, [allUsers, usersLoading, usersError, projects, selectedPromotion]);

    // Filtrer les projets
    const filteredProjects = useMemo(() => {
      return projects.filter((project: any) => {
        const matchesSearch = project.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPromotion =
          selectedPromotion === "all" || project.promotion === selectedPromotion;
        const matchesStudent =
          selectedStudent === "all" ||
          (project.students &&
            project.students.some(
              (student: any) =>
                `${student.first_name} ${student.last_name}` === selectedStudent
            ));
        return matchesSearch && matchesPromotion && matchesStudent;
      });
    }, [projects, searchTerm, selectedPromotion, selectedStudent]);

    // Limiter l'affichage
    const displayedProjects = filteredProjects.slice(0, displayCount);

    // Gestion du tri et de l'expansion
    const handleCardToggle = (projectId: string) => {
      setExpandedCard(expandedCard === projectId ? null : projectId);
    };

    // Gestion des dropdowns (fermeture au clic extérieur)
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
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Réinitialiser la sélection d'étudiant quand la promotion change
    useEffect(() => {
      setSelectedStudent("all");
    }, [selectedPromotion]);

    // Fonction de suppression
    const handleDeleteProject = async () => {
      if (!projectToDelete) return;
      setIsDeleting(true);
      setDeleteError(null);
      setDeleteSuccess(null);
      try {
        const res = await fetch(
          `http://localhost:3003/projects/${projectToDelete}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          throw new Error("Erreur lors de la suppression du projet");
        }
        setDeleteSuccess("Projet supprimé avec succès.");
        setProjectToDelete(null);
        // Rafraîchir la liste
        await fetchAllProjects();
      } catch (err: any) {
        setDeleteError(err.message || "Erreur inconnue");
      } finally {
        setIsDeleting(false);
      }
    };

    // Affiche la popup quand projectToDelete change
    useEffect(() => {
      if (projectToDelete) {
        setIsModalVisible(true);
      }
    }, [projectToDelete]);

    // Fonction pour fermer la popup avec animation
    const closeModal = () => {
      setIsModalVisible(false);
      setTimeout(() => {
        setProjectToDelete(null);
        setDeleteError(null);
        setDeleteSuccess(null);
      }, 300); // Durée de l'animation
    };

    // On attend que le userData soit chargé
    if (userLoading) {
      return <AdminLoading message="Chargement des projets..." />;
    }

    // --- Les hooks sont tous déclarés ci-dessus ---
    // On peut maintenant faire les return conditionnels

    if (loading) {
      return <AdminLoading message="Chargement des projets..." />;
    }
    if (error) {
      return (
        <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4 text-lg font-semibold">
                Erreur lors du chargement des projets
              </p>
              <p className="text-blue-800 text-sm mb-4">{error}</p>
              <Button
                onClick={fetchAllProjects}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Affichage
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
        <Header
          title="Dashboard Projets"
          description="Gestion des projets, filtrage par promotion et étudiant"
        />

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-4 mb-10">
          <AdminButton onClick={() => router.push("/admin/projects/create")}>
            <Plus size={20} />
            Ajouter un projet
          </AdminButton>
        </div>

        {/* Statistiques */}
        <AdminStatsCards
          stats={createProjectsStats(
            projects.length,
            projects.filter((p: any) => p.is_active).length,
            projects.filter((p: any) => !p.is_active).length
          )}
        />

        {/* Filtres et recherche */}
        <AdminFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPromotion={selectedPromotion}
          setSelectedPromotion={setSelectedPromotion}
          promotions={promotions}
          promotionsLoading={promotionsLoading}
          selectedSecond={selectedStudent}
          setSelectedSecond={setSelectedStudent}
          seconds={students}
          secondLabel="Étudiant"
          secondPlaceholder="Tous les étudiants"
          promotionDropdownRef={promotionDropdownRef}
          secondDropdownRef={studentDropdownRef}
          promotionDropdownOpen={promotionDropdownOpen}
          setPromotionDropdownOpen={setPromotionDropdownOpen}
          secondDropdownOpen={studentDropdownOpen}
          setSecondDropdownOpen={setStudentDropdownOpen}
        />

        {/* Grille de cartes projets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-12 auto-rows-fr transition-all duration-300">
          {displayedProjects.map((project: any) => (
            <Cards
              key={project.id}
              projectId={project.id}
              projectName={project.name}
              progress={
                project.resources
                  ? Math.min(project.resources.length * 10, 100)
                  : project.ressources
                  ? Math.min(project.ressources.length * 10, 100)
                  : 0
              }
              description={project.description}
              details={{
                startDate: project.details?.startDate
                  ? new Date(project.details.startDate).toLocaleDateString(
                      "fr-FR"
                    )
                  : new Date(project.created_at).toLocaleDateString("fr-FR"),
                endDate: project.details?.endDate
                  ? new Date(project.details.endDate).toLocaleDateString("fr-FR")
                  : new Date(
                      new Date(project.created_at).getTime() +
                        30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("fr-FR"),
                team:
                  project.details?.team ||
                  (project.students && project.students.length > 0
                    ? project.students
                        .map((s: any) => `${s.first_name} ${s.last_name}`)
                        .join(", ")
                    : "-"),
              }}
              deadline={{
                kickOff: project.deadline?.kickOff
                  ? new Date(project.deadline.kickOff).toLocaleDateString("fr-FR")
                  : new Date(project.created_at).toLocaleDateString("fr-FR"),
                followUp: project.deadline?.followUp
                  ? new Date(project.deadline.followUp).toLocaleDateString(
                      "fr-FR"
                    )
                  : new Date(
                      new Date(project.created_at).getTime() +
                        15 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("fr-FR"),
                keynote: project.deadline?.keynote
                  ? new Date(project.deadline.keynote).toLocaleDateString("fr-FR")
                  : new Date(
                      new Date(project.created_at).getTime() +
                        30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("fr-FR"),
                daysRemaining: project.deadline?.keynote
                  ? Math.max(
                      0,
                      Math.floor(
                        (new Date(project.deadline.keynote).getTime() -
                          Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : Math.max(
                      0,
                      30 -
                        Math.floor(
                          (Date.now() - new Date(project.created_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                    ),
              }}
              documentation={{
                pdfUrl:
                  project.documentation?.pdfUrl ||
                  project.ressources?.[0]?.url ||
                  "#",
                pdfName:
                  project.documentation?.pdfName ||
                  project.ressources?.[0]?.filename ||
                  "Documentation.pdf",
              }}
              tasks={[
                "Analyser les besoins",
                "Concevoir l'architecture",
                "Développer les fonctionnalités",
                "Tester l'application",
              ]}
              trophies={[
                {
                  name: "Premier commit",
                  obtained:
                    (project.resources?.length ||
                      project.ressources?.length ||
                      0) > 0,
                  description: "Premier commit réalisé",
                },
                {
                  name: "Architecture validée",
                  obtained:
                    (project.resources?.length ||
                      project.ressources?.length ||
                      0) > 2,
                  description: "Architecture du projet validée",
                },
                {
                  name: "MVP terminé",
                  obtained:
                    (project.resources?.length ||
                      project.ressources?.length ||
                      0) > 5,
                  description: "Version minimale viable terminée",
                },
                {
                  name: "Tests passants",
                  obtained:
                    (project.resources?.length ||
                      project.ressources?.length ||
                      0) > 8,
                  description: "Tous les tests passent",
                },
                {
                  name: "Projet livré",
                  obtained:
                    (project.resources?.length ||
                      project.ressources?.length ||
                      0) > 10,
                  description: "Projet entièrement livré",
                },
              ]}
              isExpanded={expandedCard === project.id}
              onToggle={() => handleCardToggle(project.id)}
              isBlurred={expandedCard !== null && expandedCard !== project.id}
              userRole={currentUser?.role || ""}
              onEdit={() => router.push(`/admin/projects/edit/${project.id}`)}
              onDelete={() => setProjectToDelete(project.id)}
            />
          ))}
        </div>

        {/* Résumé des résultats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-blue-800 font-semibold">
              {filteredProjects.length} projet(s) trouvé(s) sur {projects.length}{" "}
              total
            </span>
          </div>
        </div>

        {/* Popup de confirmation de suppression */}
        {projectToDelete && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
              isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          >
            <div
              className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300 ${
                isModalVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95"
              }`}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition"
                onClick={closeModal}
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Confirmer la suppression
              </h2>
              <p className="mb-6 text-blue-800">
                Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est
                irréversible.
              </p>
              {deleteError && <p className="text-red-600 mb-4">{deleteError}</p>}
              {deleteSuccess && (
                <p className="text-green-600 mb-4">{deleteSuccess}</p>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1 hover:bg-gray-100 text-blue-900 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer flex items-center gap-2 border-2 border-blue-200"
                  disabled={isDeleting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteProject}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
