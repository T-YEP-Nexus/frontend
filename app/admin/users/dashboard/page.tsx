"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/buttons/AdminButton";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminFilterBar from "@/components/admin/AdminFilterBar";

// Interface pour les données utilisateur dans le contexte admin
interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  campus: string;
  roles_user: string;
  profileImage?: string;
  student?: {
    student_number: string;
    promotion: string;
    major: string;
  };
  advisor?: {
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

  // Références pour les dropdowns
  const promotionDropdownRef = React.useRef<HTMLDivElement>(null);
  const roleDropdownRef = React.useRef<HTMLDivElement>(null);

  // Utiliser le hook existant pour l'utilisateur connecté
  const { userData: currentUser } = useUserData(getUserIdFromToken());

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

      // Combiner les données
      const usersWithDetails = profilesData.data.map((profile: any) => {
        const student = studentsData.success
          ? studentsData.data.find((s: any) => s.id_user_profile === profile.id)
          : null;

        const advisor = advisorsData.success
          ? advisorsData.data.find((a: any) => a.id_user_profile === profile.id)
          : null;

        // Correction : si le profil a un étudiant lié, on force le rôle à 'student'
        let role = profile.roles_user;
        if (student) {
          role = "student";
        } else if (advisor) {
          role = "advisor";
        }

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          campus: profile.campus,
          roles_user: role,
          profileImage: profile.profileImage,
          ...(student && { student }),
          ...(advisor && { advisor }),
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

  // Extraire les promotions uniques
  const promotions = useMemo(() => {
    const promoSet = new Set<string>();
    allUsers.forEach((user) => {
      if (user.student?.promotion) {
        promoSet.add(user.student.promotion);
      }
    });
    return Array.from(promoSet).sort();
  }, [allUsers]);

  // Extraire les rôles uniques
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    allUsers.forEach((user) => {
      if (user.roles_user) {
        roleSet.add(user.roles_user);
      }
    });
    return Array.from(roleSet).sort();
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
        user.student?.promotion === selectedPromotion;

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
          aValue = a.student?.promotion || "";
          bValue = b.student?.promotion || "";
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

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-blue-800 text-lg">
              Chargement des utilisateurs...
            </p>
          </div>
        </div>
      </div>
    );
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
        <AdminButton onClick={() => router.push("/admin/bulk-import")}>
          <FileText size={20} />
          Import en masse
        </AdminButton>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AdminStatCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          icon={<Users size={32} className="text-blue-600" />}
        />
        <AdminStatCard
          title="Étudiants"
          value={stats.students}
          icon={<GraduationCap size={32} className="text-blue-600" />}
        />
        <AdminStatCard
          title="Conseillers"
          value={stats.advisors}
          icon={<UserCheck size={32} className="text-blue-600" />}
        />
        <AdminStatCard
          title="Administrateurs"
          value={stats.admins}
          icon={<Shield size={32} className="text-blue-600" />}
        />
      </div>

      {/* Filtres et recherche */}
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPromotion={selectedPromotion}
        setSelectedPromotion={setSelectedPromotion}
        promotions={promotions}
        selectedSecond={selectedRole}
        setSelectedSecond={setSelectedRole}
        seconds={roles}
        secondLabel="Rôle"
        secondPlaceholder="Tous les rôles"
        promotionDropdownRef={promotionDropdownRef}
        secondDropdownRef={roleDropdownRef}
        promotionDropdownOpen={promotionDropdownOpen}
        setPromotionDropdownOpen={setPromotionDropdownOpen}
        secondDropdownOpen={roleDropdownOpen}
        setSecondDropdownOpen={setRoleDropdownOpen}
      />

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th
                  className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
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
                  className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
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
                  className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider cursor-pointer hover:bg-blue-200 transition-all duration-300"
                  onClick={() => handleSort("promotion")}
                >
                  <div className="flex items-center gap-2">
                    Promotion
                    {sortBy === "promotion" && (
                      <span className="text-blue-600 font-bold">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  Campus
                </th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-200/50">
              {filteredAndSortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-100/80 transition-all duration-300 cursor-pointer group"
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-14 w-14">
                        <img
                          className="h-14 w-14 rounded-full border-3 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                          src={user.profileImage || "/images/Avatar.png"}
                          alt={`${user.first_name} ${user.last_name}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-semibold text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                          {user.first_name} {user.last_name}
                        </div>
                        {user.student?.student_number && (
                          <div className="text-sm text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                            {user.student.student_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        {getRoleIcon(user.roles_user)}
                      </div>
                      <span className="text-sm font-medium text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                        {getRoleLabel(user.roles_user)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                      {user.student?.promotion || "-"}
                    </div>
                    {user.student?.major && (
                      <div className="text-sm text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                        {user.student.major}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                        <Mail
                          size={16}
                          className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                        />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3 text-sm text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                          <Phone
                            size={16}
                            className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                          />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3 text-sm text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                      <MapPin
                        size={16}
                        className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                      />
                      {user.campus}
                    </div>
                    {user.advisor?.room && (
                      <div className="flex items-center gap-3 text-sm text-blue-600 group-hover:text-blue-500 transition-colors duration-300">
                        <Building
                          size={16}
                          className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
                        />
                        {user.advisor.room}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(user)}
                        className="group/btn border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:scale-105 cursor-pointer"
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/users/edit/${user.id}`)
                        }
                        className="group/btn border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:scale-105 cursor-pointer"
                      >
                        Modifier
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message si aucun utilisateur trouvé */}
        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl inline-block mb-6">
              <Users size={64} className="text-blue-600" />
            </div>
            <p className="text-blue-800 text-xl font-semibold mb-2">
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
        )}
      </div>

      {/* Résumé des résultats */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-blue-800 font-semibold">
            {filteredAndSortedUsers.length} utilisateur(s) trouvé(s) sur{" "}
            {allUsers.length} total
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
            className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ${
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white rounded-t-2xl">
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
            <div className="p-6 space-y-6">
              {/* Photo de profil et informations principales */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-24 w-24 rounded-full border-4 border-blue-200 shadow-lg"
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
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Informations de contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-blue-600" />
                  Informations académiques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {selectedUser.student && (
                    <>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-blue-500" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">
                            Promotion
                          </p>
                          <p className="text-blue-900">
                            {selectedUser.student.promotion}
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
                  {selectedUser.advisor && (
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
                <AdminButton
                  onClick={() =>
                    router.push(`/admin/users/edit/${selectedUser.id}`)
                  }
                  className="flex-1"
                >
                  Modifier l'utilisateur
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
