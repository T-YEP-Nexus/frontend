"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  BookOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronDown,
  X,
  User,
  Clock,
  Home,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import usePromotionsData from "@/hooks/usePromotionsData";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminStatsCards, {
  createUsersStats,
} from "@/components/admin/AdminStatsCards";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminLoading from "@/components/admin/AdminLoading";
import DevelopmentBadge from "@/components/ui/DevelopmentBadge";

// Interface pour les promotions
interface Promotion {
  id: string; // UUID
  name: string;
  created_at: string;
}

// Interface pour les données utilisateur dans le contexte admin
interface AdminUser {
  id: string;
  id_user: string; // UUID de l'utilisateur dans la table user
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  campus: string;
  roles_user: string;
  profileImage?: string;
  student?: {
    id: number;
    student_number: string;
    id_promotion: string; // UUID de la promotion
    promotion_name?: string; // Nom de la promotion (à récupérer)
    major: string;
  };
  advisor?: {
    id: number;
    major: string;
    room: string;
    availability: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "promotion" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotionDropdownOpen, setPromotionDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [displayedUsers, setDisplayedUsers] = useState<number>(10);

  // Références pour les dropdowns
  const promotionDropdownRef = useRef<HTMLDivElement | null>(null);
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);

  // Utiliser le hook existant pour l'utilisateur connecté
  const { userData: currentUser } = useUserData(getUserIdFromToken());

  // Hook pour récupérer les promotions
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  // Fonction pour récupérer le nom de promotion par ID
  const getPromotionNameById = (promotionId: string): string => {
    if (
      !promotions ||
      !promotionId ||
      promotionId === "null" ||
      promotionId === "undefined"
    ) {
      console.log(
        "Promotion inconnue - promotions:",
        !!promotions,
        "promotionId:",
        promotionId
      );
      return "Promotion inconnue";
    }
    console.log(
      "Recherche promotion pour ID:",
      promotionId,
      "Type:",
      typeof promotionId
    );
    console.log(
      "Promotions disponibles:",
      promotions.map((p) => ({ id: p.id, name: p.name, type: typeof p.id }))
    );
    // Chercher par ID exact
    const promotion = promotions.find((p) => p.id === promotionId);
    console.log("Promotion trouvée:", promotion);
    return promotion ? promotion.name : "Promotion inconnue";
  };

  // Fonction pour récupérer l'ID de promotion par nom
  const getPromotionIdByName = (promotionName: string): string | null => {
    if (!promotions || !promotionName) return null;
    const promotion = promotions.find((p) => p.name === promotionName);
    return promotion ? promotion.id : null;
  };

  // Fonction pour récupérer tous les utilisateurs
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

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

      // Récupérer tous les conseillers
      const advisorsResponse = await fetch("http://localhost:3004/advisors");
      const advisorsData = advisorsResponse.ok
        ? await advisorsResponse.json()
        : { success: false, data: [] };

      // Récupérer tous les utilisateurs pour avoir les emails
      const usersResponse = await fetch("http://localhost:3001/users");
      const usersData = usersResponse.ok
        ? await usersResponse.json()
        : { success: false, data: [] };

      // Attendre que les promotions soient chargées
      if (!promotions || promotionsLoading) {
        console.log("Promotions pas encore chargées, on attend...");
        return; // On sort de la fonction, elle sera rappelée quand les promotions seront chargées
      }

      console.log("Promotions chargées, on peut traiter les utilisateurs");
      console.log("Promotions disponibles:", promotions);

      // Combiner les données
      const usersWithDetails = profilesData.data.map((profile: any) => {
        const student = studentsData.success
          ? studentsData.data.find((s: any) => s.id_user_profile === profile.id)
          : null;

        const advisor = advisorsData.success
          ? advisorsData.data.find((a: any) => a.id_user_profile === profile.id)
          : null;

        // Récupérer l'email depuis la table user
        const user = usersData.success
          ? usersData.data.find((u: any) => u.id === profile.id_user)
          : null;

        // Utiliser le rôle réel stocké dans la base de données
        const role = profile.roles_user;

        // Si c'est un étudiant, récupérer le nom de la promotion
        let studentWithPromotion = null;
        if (student) {
          console.log("Étudiant trouvé:", student);
          console.log(
            "ID promotion étudiant:",
            student.id_promotion,
            "Type:",
            typeof student.id_promotion
          );
          // Récupérer l'ID de promotion depuis les données étudiant
          const promotionId = student.id_promotion;
          console.log("ID promotion à rechercher:", promotionId);

          // Convertir l'ID en nom de promotion
          const promotionName = getPromotionNameById(promotionId);
          console.log("Nom de promotion trouvé:", promotionName);

          studentWithPromotion = {
            ...student,
            promotion_name: promotionName,
          };
          console.log("Étudiant avec promotion:", studentWithPromotion);
        }

        return {
          id: profile.id,
          id_user: profile.id_user, // UUID de l'utilisateur
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: user ? user.email : profile.email, // Email depuis la table user
          phone: profile.phone,
          address: profile.address,
          campus: profile.campus,
          roles_user: role,
          profileImage: profile.profileImage,
          ...(studentWithPromotion && { student: studentWithPromotion }),
          ...(advisor && {
            advisor: {
              ...advisor,
              major: advisor.specialty || advisor.major || "", // Gérer les deux noms de champ
              availability: advisor.availibity || advisor.availability || "", // Gérer les deux noms de champ
            },
          }),
        };
      });

      setAllUsers(usersWithDetails);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les droits d'accès et charger les données
  React.useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          router.push("/login");
          return;
        }

        // Vérifier si l'utilisateur est admin ou advisor
        const response = await fetch(
          `http://localhost:3004/profile/user/${userId}`
        );
        console.log("userId!!!!!!!!!!bastian", userId);
        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.data) {
            if (
              userData.data.roles_user !== "admin" &&
              userData.data.roles_user !== "advisor"
            ) {
              router.push("/dashboard?error=unauthorized");
              return;
            }
            // Si admin ou advisor, charger tous les utilisateurs
            await fetchAllUsers();
          } else {
            console.warn(
              "Réponse API invalide, chargement des données quand même"
            );
            await fetchAllUsers();
          }
        } else {
          console.warn("Erreur API, chargement des données quand même");
          await fetchAllUsers();
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits:", error);
        // En cas d'erreur, on charge quand même les données pour éviter le blocage
        await fetchAllUsers();
      }
    };

    checkAccessAndLoadData();
  }, [router]);

  // Recharger les données quand on revient sur la page (après modification)
  React.useEffect(() => {
    const handleFocus = () => {
      // Recharger les données quand la page reprend le focus
      fetchAllUsers();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Recharger les utilisateurs quand les promotions sont chargées
  React.useEffect(() => {
    if (promotions && !promotionsLoading && allUsers.length === 0) {
      console.log("Promotions chargées, on recharge les utilisateurs");
      fetchAllUsers();
    }
  }, [promotions, promotionsLoading, allUsers.length]);

  // Gestionnaire de clic à l'extérieur pour fermer les dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promotionDropdownRef.current &&
        !promotionDropdownRef.current.contains(event.target as Node)
      ) {
        setPromotionDropdownOpen(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extraire les promotions utilisées par les utilisateurs
  const usedPromotions = useMemo(() => {
    const promoSet = new Set<string>();
    allUsers.forEach((user) => {
      if (user.student?.promotion_name) {
        promoSet.add(user.student.promotion_name);
      }
    });
    return Array.from(promoSet);
  }, [allUsers]);

  // Utiliser toutes les promotions de l'API
  const availablePromotions = useMemo(() => {
    if (!promotions || promotionsLoading) {
      return usedPromotions.sort();
    }

    // Utiliser toutes les promotions de l'API
    const allPromotions = promotions.map((promo) => promo.name).sort();
    console.log(
      "Promotions disponibles dans availablePromotions:",
      allPromotions
    );
    console.log("Promotions brutes:", promotions);

    return allPromotions;
  }, [promotions, promotionsLoading, usedPromotions]);

  // Obtenir le label du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Étudiant";
      case "advisor":
        return "Conseiller";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  // Extraire les rôles uniques avec leurs labels français
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    allUsers.forEach((user) => {
      if (user.roles_user) {
        roleSet.add(user.roles_user);
      }
    });

    // Créer des objets avec label et valeur
    const roleObjects = Array.from(roleSet).map((role) => ({
      value: role,
      label: getRoleLabel(role),
    }));

    // Trier par label français
    return roleObjects.sort((a, b) => a.label.localeCompare(b.label));
  }, [allUsers]);

  // Filtrer et trier les utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = allUsers.filter((user) => {
      // Vérifications de sécurité pour éviter les erreurs undefined
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      const email = user.email || "";
      const studentNumber = user.student?.student_number || "";
      const rolesUser = user.roles_user || "";

      const matchesSearch =
        firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Correction : filtre insensible à la casse
      const matchesPromotion =
        selectedPromotion === "all" ||
        user.student?.promotion_name === selectedPromotion;

      const matchesRole =
        selectedRole === "all" ||
        (rolesUser && rolesUser.toLowerCase() === selectedRole.toLowerCase());

      return matchesSearch && matchesPromotion && matchesRole;
    });

    // Trier les utilisateurs
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case "name":
          aValue = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
          bValue = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
          break;
        case "promotion":
          aValue = a.student?.promotion_name || "";
          bValue = b.student?.promotion_name || "";
          break;
        case "role":
          aValue = a.roles_user || "";
          bValue = b.roles_user || "";
          break;
        default:
          aValue = "";
          bValue = "";
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [
    allUsers,
    searchTerm,
    selectedPromotion,
    selectedRole,
    sortBy,
    sortOrder,
  ]);

  // Utilisateurs à afficher (pagination)
  const usersToDisplay = useMemo(() => {
    return filteredAndSortedUsers.slice(0, displayedUsers);
  }, [filteredAndSortedUsers, displayedUsers]);

  // Log de débogage pour les promotions dans le tableau
  React.useEffect(() => {
    if (usersToDisplay.length > 0) {
      console.log("=== DEBUG PROMOTIONS DANS LE TABLEAU ===");
      usersToDisplay.forEach((user) => {
        if (user.student) {
          console.log(`${user.first_name} ${user.last_name}:`, {
            promotion_name: user.student.promotion_name,
            id_promotion: user.student.id_promotion,
            student_data: user.student,
          });
        }
      });
      console.log("=== FIN DEBUG ===");
    }
  }, [usersToDisplay]);

  // Fonction pour afficher plus d'utilisateurs
  const handleShowMore = () => {
    setDisplayedUsers((prev) => prev + 20);
  };

  // Statistiques
  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const students = allUsers.filter((u) => u.roles_user === "student").length;
    const advisors = allUsers.filter((u) => u.roles_user === "advisor").length;
    const admins = allUsers.filter((u) => u.roles_user === "admin").length;

    return { totalUsers, students, advisors, admins };
  }, [allUsers]);

  // Obtenir l'icône pour le rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap size={16} className="text-blue-600" />;
      case "advisor":
        return <UserCheck size={16} className="text-blue-600" />;
      case "admin":
        return <Shield size={16} className="text-blue-600" />;
      default:
        return <Users size={16} className="text-blue-600" />;
    }
  };

  // Vérifier si l'utilisateur connecté peut supprimer un utilisateur donné
  const canDeleteUser = (userToDelete: AdminUser): boolean => {
    if (!currentUser) return false;

    // Les admins peuvent tout supprimer
    if (currentUser.role === "admin") return true;

    // Les advisors ne peuvent supprimer que les étudiants
    if (currentUser.role === "advisor") {
      return userToDelete.roles_user === "student";
    }

    return false;
  };

  // Vérifier si l'utilisateur connecté peut modifier un utilisateur donné
  const canEditUser = (userToEdit: AdminUser): boolean => {
    if (!currentUser) return false;

    // Les admins peuvent tout modifier
    if (currentUser.role === "admin") return true;

    // Les advisors ne peuvent modifier que les étudiants
    if (currentUser.role === "advisor") {
      return userToEdit.roles_user === "student";
    }

    return false;
  };

  // Obtenir le message d'erreur pour le bouton de suppression
  const getDeleteButtonMessage = (userToDelete: AdminUser): string => {
    if (!currentUser) return "Non autorisé";

    if (currentUser.role === "admin") return "";

    if (currentUser.role === "advisor") {
      if (userToDelete.roles_user === "admin") {
        return "Les advisors ne peuvent pas supprimer les admins";
      }
      if (userToDelete.roles_user === "advisor") {
        return "Les advisors ne peuvent pas supprimer d'autres advisors";
      }
    }

    return "";
  };

  // Obtenir le message d'erreur pour le bouton de modification
  const getEditButtonMessage = (userToEdit: AdminUser): string => {
    if (!currentUser) return "Non autorisé";

    if (currentUser.role === "admin") return "";

    if (currentUser.role === "advisor") {
      if (userToEdit.roles_user === "admin") {
        return "Les advisors ne peuvent pas modifier les admins";
      }
      if (userToEdit.roles_user === "advisor") {
        return "Les advisors ne peuvent pas modifier d'autres advisors";
      }
    }

    return "";
  };

  // Gestion du tri
  const handleSort = (field: "name" | "promotion" | "role") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Gestion de la modale
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    // Délai pour permettre l'animation d'ouverture
    setTimeout(() => {
      setIsModalVisible(true);
    }, 10);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedUser(null);
    }, 300); // Durée de l'animation
  };

  // Affiche la popup quand userToDelete change
  React.useEffect(() => {
    if (userToDelete) {
      setIsModalVisible(true);
    }
  }, [userToDelete]);

  // Fonction pour fermer la popup avec animation
  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }, 300); // Durée de l'animation
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Supprimer les données spécifiques au rôle
      if (userToDelete.student) {
        const studentResponse = await fetch(
          `http://localhost:3004/student/${userToDelete.student.id}`,
          { method: "DELETE" }
        );
        if (!studentResponse.ok) {
          const errorData = await studentResponse.json();
          throw new Error(
            errorData.message || "Erreur lors de la suppression de l'étudiant"
          );
        }
      }

      if (userToDelete.advisor) {
        const advisorResponse = await fetch(
          `http://localhost:3004/advisor/${userToDelete.advisor.id}`,
          { method: "DELETE" }
        );
        if (!advisorResponse.ok) {
          const errorData = await advisorResponse.json();
          throw new Error(
            errorData.message || "Erreur lors de la suppression du conseiller"
          );
        }
      }

      // 2. Supprimer le profil utilisateur
      const profileResponse = await fetch(
        `http://localhost:3004/profile/${userToDelete.id}`,
        { method: "DELETE" }
      );
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression du profil"
        );
      }

      // 3. Supprimer l'utilisateur
      const userResponse = await fetch(
        `http://localhost:3001/users/${userToDelete.id_user}`,
        { method: "DELETE" }
      );
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'utilisateur"
        );
      }

      // Recharger la liste des utilisateurs
      await fetchAllUsers();

      // Fermer la modale avec animation
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'utilisateur"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Chargement des utilisateurs..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 text-lg font-semibold">
              Erreur lors du chargement des utilisateurs
            </p>
            <p className="text-blue-800 text-sm mb-4">{error}</p>
            <Button
              onClick={fetchAllUsers}
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

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12">
      <Header
        title="Dashboard Utilisateurs"
        description="Gestion des utilisateurs et des promotions"
      />

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-4 mb-10">
        <AdminButton onClick={() => router.push("/admin/users/register")}>
          <Users size={20} />
          Créer un utilisateur
        </AdminButton>
        <AdminButton onClick={() => router.push("/admin/promotions/create")}>
          <FileText size={20} />
          Créer une promotion
        </AdminButton>
        <DevelopmentBadge>
          <AdminButton onClick={() => router.push("/admin/bulk-import")}>
            <FileText size={20} />
            Import en masse
          </AdminButton>
        </DevelopmentBadge>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6">
        <AdminFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Rechercher par nom, email ou campus..."
          showSearch={true}
          selectedPromotion={selectedPromotion}
          setSelectedPromotion={setSelectedPromotion}
          promotions={availablePromotions}
          promotionsLoading={promotionsLoading}
          promotionPlaceholder="Toutes les promotions"
          showPromotionFilter={true}
          selectedSecond={selectedRole}
          setSelectedSecond={setSelectedRole}
          seconds={roles}
          secondLabel="Rôle"
          secondPlaceholder="Tous les rôles"
          showSecondFilter={true}
          promotionDropdownRef={promotionDropdownRef}
          secondDropdownRef={roleDropdownRef}
          promotionDropdownOpen={promotionDropdownOpen}
          setPromotionDropdownOpen={setPromotionDropdownOpen}
          secondDropdownOpen={roleDropdownOpen}
          setSecondDropdownOpen={setRoleDropdownOpen}
          title="Filtres et recherche"
          showTitle={true}
        />
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200/50">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h2 className="font-bold text-2xl text-blue-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            Liste des utilisateurs
          </h2>
        </div>
        {/* Version bureau: tableau (masqué sur mobile) */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Utilisateur
                      {sortBy === "name" && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-2">
                      Rôle
                      {sortBy === "role" && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
                    onClick={() => handleSort("promotion")}
                  >
                    <div className="flex items-center gap-2">
                      Promo/Dispo
                      {sortBy === "promotion" && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Campus
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-200/50">
                {usersToDisplay.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-100/80 transition-all duration-300 cursor-pointer group"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full border-2 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                            src={user.profileImage || "/images/Avatar.png"}
                            alt={`${user.first_name} ${user.last_name}`}
                          />
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-semibold text-blue-900 group-hover:text-blue-700 transition-colors duration-300 truncate max-w-[120px]">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.student?.student_number && (
                            <div className="text-xs text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                              {user.student.student_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          {getRoleIcon(user.roles_user)}
                        </div>
                        <span className="text-xs font-medium text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                          {getRoleLabel(user.roles_user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                        {user.roles_user === "student"
                          ? user.student?.promotion_name ||
                            "Promotion non définie"
                          : user.advisor?.major ||
                            user.student?.major ||
                            "Spécialité non définie"}
                      </div>
                      {user.roles_user === "student" && user.student?.major && (
                        <div className="text-xs text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                          {user.student.major}
                        </div>
                      )}
                      {(user.roles_user === "advisor" ||
                        user.roles_user === "admin") &&
                        user.advisor?.availability && (
                          <div className="text-xs text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                            {user.advisor.availability}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                          <Mail
                            size={12}
                            className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                          />
                          <span className="truncate max-w-[120px]">
                            {user.email}
                          </span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                            <Phone
                              size={12}
                              className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                            />
                            <span className="truncate max-w-[100px]">
                              {user.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                        <MapPin
                          size={12}
                          className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                        />
                        <span className="truncate max-w-[100px]">
                          {user.campus}
                        </span>
                      </div>
                      {user.advisor?.room && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                          <Building
                            size={12}
                            className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                          />
                          <span className="truncate max-w-[80px]">
                            {user.advisor.room}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                          className="group/btn border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:scale-105 cursor-pointer text-xs"
                        >
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/users/edit/${user.id}`)
                          }
                          className={`group/btn border font-medium px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-xs ${
                            canEditUser(user)
                              ? "border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:scale-105"
                              : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                          }`}
                          disabled={!canEditUser(user)}
                          title={getEditButtonMessage(user)}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className={`group/btn border font-medium px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-xs ${
                            canDeleteUser(user)
                              ? "border-red-200 text-red-700 hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105"
                              : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                          }`}
                          disabled={!canDeleteUser(user)}
                          title={getDeleteButtonMessage(user)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Version mobile: cartes (affichée uniquement sur mobile) */}
        <div className="md:hidden">
          <div className="space-y-3 px-3 py-3">
            {usersToDisplay.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 w-12 rounded-full border-2 border-blue-200"
                    src={user.profileImage || "/images/Avatar.png"}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-blue-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                        {getRoleLabel(user.roles_user)}
                      </span>
                    </div>
                    {user.student?.student_number && (
                      <p className="text-xs text-blue-600 truncate">
                        {user.student.student_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="text-[11px] text-blue-700">
                    <span className="block font-medium text-blue-900">
                      {user.roles_user === "student"
                        ? "Promotion"
                        : "Spécialité"}
                    </span>
                    <span className="block">
                      {user.roles_user === "student"
                        ? user.student?.promotion_name || "Non définie"
                        : user.advisor?.major ||
                          user.student?.major ||
                          "Non définie"}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-700">
                    <span className="block font-medium text-blue-900">
                      Campus
                    </span>
                    <span className="block truncate">{user.campus}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-blue-700">
                    <span className="block font-medium text-blue-900">
                      Contact
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="truncate">{user.email}</span>
                      {user.phone && (
                        <span className="truncate">• {user.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewUser(user)}
                    className="border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-3 py-1.5 rounded-lg cursor-pointer text-xs"
                  >
                    Voir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                    className={`border font-medium px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-xs ${
                      canEditUser(user)
                        ? "border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                        : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                    }`}
                    disabled={!canEditUser(user)}
                    title={getEditButtonMessage(user)}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteModal(true);
                    }}
                    className={`ml-auto border font-medium px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-xs ${
                      canDeleteUser(user)
                        ? "border-red-200 text-red-700 hover:bg-red-600 hover:border-red-600 hover:text-white"
                        : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                    }`}
                    disabled={!canDeleteUser(user)}
                    title={getDeleteButtonMessage(user)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton Afficher plus */}
        {filteredAndSortedUsers.length > displayedUsers && (
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200">
            <div className="flex justify-center">
              <Button
                onClick={handleShowMore}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
              >
                <Users size={20} />
                Afficher plus (
                {Math.min(
                  20,
                  filteredAndSortedUsers.length - displayedUsers
                )}{" "}
                de plus)
              </Button>
            </div>
          </div>
        )}

        {/* Message si aucun utilisateur trouvé */}
        {filteredAndSortedUsers.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl inline-block mb-6">
                <Users size={48} className="text-blue-600" />
              </div>
              <p className="text-blue-800 text-lg font-semibold mb-2">
                {searchTerm ||
                selectedPromotion !== "all" ||
                selectedRole !== "all"
                  ? "Aucun utilisateur ne correspond aux critères de recherche"
                  : "Aucun utilisateur trouvé"}
              </p>
              <p className="text-blue-600 text-sm">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Résumé des résultats */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-blue-800 font-semibold text-sm">
            {usersToDisplay.length} utilisateur(s) affiché(s) sur{" "}
            {filteredAndSortedUsers.length} trouvé(s)
          </span>
        </div>
      </div>

      {/* Modale de détails utilisateur */}
      {isModalOpen && selectedUser && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
            isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-xl md:max-w-2xl mx-4 sm:mx-6 max-h-[85vh] overflow-y-auto relative transform transition-all duration-300 ${
              isModalVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transform: isModalVisible
                ? "translateY(0) scale(1)"
                : "translateY(2rem) scale(0.95)",
            }}
          >
            {/* Header de la modale */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 md:p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Détails de l'utilisateur
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Informations complètes du profil
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenu de la modale */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Photo de profil et informations principales */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-blue-200 shadow-lg"
                    src={selectedUser.profileImage || "/images/Avatar.png"}
                    alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      {getRoleIcon(selectedUser.roles_user)}
                    </div>
                    <span className="text-lg font-semibold text-blue-700">
                      {getRoleLabel(selectedUser.roles_user)}
                    </span>
                  </div>
                  {selectedUser.student?.student_number && (
                    <div className="text-blue-600 font-medium">
                      Numéro étudiant: {selectedUser.student.student_number}
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 md:p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Informations de contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Email</p>
                      <p className="text-blue-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Téléphone
                        </p>
                        <p className="text-blue-900">{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <Home size={16} className="text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Adresse
                        </p>
                        <p className="text-blue-900">{selectedUser.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations académiques/professionnelles */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 md:p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-blue-600" />
                  Informations académiques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Campus
                      </p>
                      <p className="text-blue-900">{selectedUser.campus}</p>
                    </div>
                  </div>

                  {/* Informations spécifiques aux étudiants */}
                  {selectedUser.roles_user === "student" &&
                    selectedUser.student && (
                      <>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Promotion
                            </p>
                            <p className="text-blue-900">
                              {selectedUser.student.promotion_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Spécialité
                            </p>
                            <p className="text-blue-900">
                              {selectedUser.student.major}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Informations spécifiques aux conseillers */}
                  {selectedUser.roles_user === "advisor" &&
                    selectedUser.advisor && (
                      <>
                        <div className="flex items-center gap-3">
                          <Building size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Salle
                            </p>
                            <p className="text-blue-900">
                              {selectedUser.advisor.room}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Disponibilité
                            </p>
                            <p className="text-blue-900">
                              {selectedUser.advisor.availability}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Spécialité
                            </p>
                            <p className="text-blue-900">
                              {selectedUser.advisor.major}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6 border-t border-blue-200">
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/admin/users/edit/${selectedUser.id}`)
                  }
                  disabled={!canEditUser(selectedUser)}
                  className={`flex-1 font-semibold px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    canEditUser(selectedUser)
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed opacity-50"
                  }`}
                  title={getEditButtonMessage(selectedUser)}
                >
                  Modifier l'utilisateur
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && userToDelete && (
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
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
              est irréversible.
            </p>
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
              <p className="font-semibold text-red-900 mb-1">
                {userToDelete.first_name} {userToDelete.last_name}
              </p>
              <p className="text-sm text-red-700">{userToDelete.email}</p>
              <p className="text-xs text-red-600 mt-1">
                Rôle : {getRoleLabel(userToDelete.roles_user)}
              </p>
            </div>
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
                onClick={handleDeleteUser}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
