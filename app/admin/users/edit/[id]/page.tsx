"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Loader2,
  Lock,
  Shield,
  Users,
  BookOpen,
  Calendar,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import PromotionDropdown from "@/components/ui/promotion-dropdown";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import { useUserData } from "@/hooks/useUserData";
import usePromotionsData from "@/hooks/usePromotionsData";
import { getUserIdFromToken } from "@/lib/auth";
import { getUserProfileData } from "@/lib/userData";
import AdminLoading from "@/components/admin/AdminLoading";

// Type générique pour les promotions pour éviter les conflits
interface PromotionData {
  id: string;
  name: string;
  created_at?: string;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  campus: string;
  role: "student" | "advisor" | "admin";
  promotion?: string;
  major?: string;
  room?: string;
  availability?: string;
  address?: string;
}

type UserRole = "student" | "advisor" | "admin";

// Interface pour les données utilisateur dans le contexte admin
interface AdminUser {
  id: string;
  id_user: string; // UUID de l'utilisateur dans la table user
  first_name: string;
  last_name: string;
  email: string;
  originalEmail: string; // Email original pour comparaison
  phone: string;
  address: string;
  campus: string;
  roles_user: string;
  profileImage?: string;
  student?: {
    id: number;
    student_number: string;
    promotion: string;
    major: string;
  };
  advisor?: {
    id: number;
    specialty: string;
    room: string;
    availability: string;
  };
}

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<EditFormData>>({});
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [isPasswordChange, setIsPasswordChange] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    campus: "",
    role: "student",
    promotion: "",
    major: "",
    room: "",
    availability: "",
    address: "",
  });

  const { userData: currentUser } = useUserData(getUserIdFromToken());

  // Hook pour récupérer les promotions
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  // Fonction pour récupérer l'ID de promotion par nom
  const getPromotionIdByName = (promotionName: string): string => {
    if (!promotions || !promotionName) return "";
    const promotion = promotions.find(
      (p: { id: string; name: string }) => p.name === promotionName
    );
    return promotion ? promotion.id : "";
  };

  // Récupérer le rôle de l'utilisateur connecté
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUserId = getUserIdFromToken();
        if (currentUserId) {
          const profileData = await getUserProfileData(currentUserId);
          setUserRole(profileData.roles_user);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        router.push("/login");
      }
    };

    fetchUserRole();
  }, [router]);

  // Récupérer les données de l'utilisateur à modifier
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log(
          "Tentative de récupération du profil avec l'ID:",
          userId,
          "Type:",
          typeof userId
        );
        // Récupérer le profil utilisateur
        const profilesResponse = await fetch(
          `http://localhost:3004/profile/${userId}`
        );
        if (!profilesResponse.ok) {
          const errorText = await profilesResponse.text();
          console.error("Erreur API:", profilesResponse.status, errorText);
          throw new Error(
            `Erreur lors de la récupération du profil (${profilesResponse.status}): ${errorText}`
          );
        }
        const profileData = await profilesResponse.json();

        if (!profileData.success) {
          throw new Error(profileData.message || "Erreur serveur");
        }

        // Récupérer les données étudiant si applicable
        const studentsResponse = await fetch(
          `http://localhost:3004/student/profile/${userId}`
        );
        const studentsData = studentsResponse.ok
          ? await studentsResponse.json()
          : { success: false, data: null };

        // Récupérer toutes les promotions pour convertir l'ID en nom
        const promotionsResponse = await fetch(
          "http://localhost:3004/promotions"
        );
        const promotionsData = promotionsResponse.ok
          ? await promotionsResponse.json()
          : { success: false, data: [] };

        // Fonction pour récupérer le nom de promotion par ID
        const getPromotionNameById = (promotionId: string): string => {
          if (!promotionsData.success || !promotionId) return "";
          const promotion = promotionsData.data.find(
            (p: { id: string; name: string }) => p.id === promotionId
          );
          return promotion ? promotion.name : "";
        };

        // Récupérer les données conseiller si applicable
        const advisorsResponse = await fetch(
          `http://localhost:3004/advisor/profile/${userId}`
        );
        const advisorsData = advisorsResponse.ok
          ? await advisorsResponse.json()
          : { success: false, data: null };

        // Récupérer l'email original depuis la table user
        const userResponse = await fetch(
          `http://localhost:3001/users/${profileData.data.id_user}`
        );
        const userData = userResponse.ok
          ? await userResponse.json()
          : { success: false, data: null };

        // Combiner les données
        const userWithDetails = {
          id: profileData.data.id,
          id_user: profileData.data.id_user, // UUID de l'utilisateur
          first_name: profileData.data.first_name,
          last_name: profileData.data.last_name,
          email: userData.success
            ? userData.data.email
            : profileData.data.email, // Email original de la table user
          originalEmail: userData.success
            ? userData.data.email
            : profileData.data.email, // Email original pour comparaison
          phone: profileData.data.phone,
          address: profileData.data.address,
          campus: profileData.data.campus,
          roles_user: profileData.data.roles_user,
          profileImage: profileData.data.profileImage,
          ...(studentsData.success &&
            studentsData.data && {
              student: {
                ...studentsData.data,
                promotion: getPromotionNameById(studentsData.data.id_promotion),
              },
            }),
          ...(advisorsData.success &&
            advisorsData.data && {
              advisor: {
                ...advisorsData.data,
                specialty: advisorsData.data.specialty || "",
                availability: advisorsData.data.availability || "",
              },
            }),
        };

        setUserData(userWithDetails);

        // Pré-remplir le formulaire
        setFormData({
          firstName: userWithDetails.first_name || "",
          lastName: userWithDetails.last_name || "",
          email: userWithDetails.email || "",
          phone: userWithDetails.phone || "",
          password: "",
          confirmPassword: "",
          campus: userWithDetails.campus || "",
          role: userWithDetails.roles_user as UserRole,
          promotion: userWithDetails.student?.promotion || "",
          major:
            userWithDetails.student?.major ||
            userWithDetails.advisor?.specialty ||
            "",
          room: userWithDetails.advisor?.room || "",
          availability: userWithDetails.advisor?.availability || "",
          address: userWithDetails.address || "",
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        router.push("/admin/users/dashboard?error=user-not-found");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);

  // Vérifier que l'utilisateur a les droits d'accès (admin ou advisor)
  useEffect(() => {
    if (!isLoading && userRole && !["admin", "advisor"].includes(userRole)) {
      router.push("/dashboard?error=unauthorized");
    }
  }, [userRole, isLoading, router]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return <AdminLoading message="Chargement des données utilisateur..." />;
  }

  // Ne pas afficher la page si l'utilisateur n'a pas les droits
  if (!userRole || !["admin", "advisor"].includes(userRole)) {
    return null;
  }

  // Options de rôles disponibles selon l'utilisateur connecté
  const getAvailableRoles = (): {
    value: UserRole;
    label: string;
    icon: React.ReactNode;
  }[] => {
    const allRoles = [
      {
        value: "student" as UserRole,
        label: "Étudiant",
        icon: <BookOpen size={20} />,
      },
      {
        value: "advisor" as UserRole,
        label: "Conseiller",
        icon: <Users size={20} />,
      },
      {
        value: "admin" as UserRole,
        label: "Administrateur",
        icon: <Shield size={20} />,
      },
    ];

    // Si l'utilisateur est admin, il peut modifier tous les rôles
    if (userRole === "admin") {
      return allRoles;
    }

    // Si l'utilisateur est advisor, il ne peut modifier que des étudiants
    if (userRole === "advisor") {
      return allRoles.filter((role) => role.value === "student");
    }

    return allRoles.filter((role) => role.value === "student");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof EditFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePromotionChange = (promotion: string) => {
    setFormData((prev) => ({
      ...prev,
      promotion,
    }));

    // Effacer l'erreur du champ promotion
    if (errors.promotion) {
      setErrors((prev) => ({
        ...prev,
        promotion: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditFormData> = {};

    // Validation prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation téléphone
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    } else if (
      !/^(\+33|0)[1-9](\d{8})$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Format de téléphone invalide";
    }

    // Validation mot de passe (seulement si changement)
    if (isPasswordChange) {
      if (!formData.password) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères";
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password =
          "Le mot de passe doit contenir au moins une majuscule";
      } else if (!/(?=.*[0-9])/.test(formData.password)) {
        newErrors.password =
          "Le mot de passe doit contenir au moins un chiffre";
      }

      // Validation confirmation mot de passe
      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "La confirmation du mot de passe est requise";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    // Validation campus
    if (!formData.campus.trim()) {
      newErrors.campus = "Le campus est requis";
    }

    // Validation promotion et major pour les étudiants
    if (formData.role === "student") {
      if (!formData.promotion?.trim()) {
        newErrors.promotion = "La promotion est requise pour un étudiant";
      }
      if (!formData.major?.trim()) {
        newErrors.major = "La spécialité est requise pour un étudiant";
      }
    }

    // Validation des champs spécifiques aux conseillers
    if (formData.role === "advisor") {
      if (!formData.major?.trim()) {
        newErrors.major = "La spécialité est requise pour un conseiller";
      }
      if (!formData.room?.trim()) {
        newErrors.room = "La salle est requise pour un conseiller";
      }
      if (!formData.availability?.trim()) {
        newErrors.availability =
          "Les jours de présence sont requis pour un conseiller";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // 1. Mettre à jour le profil utilisateur
      const profileUpdateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        campus: formData.campus,
        roles_user: formData.role,
      };

      const profileResponse = await fetch(
        `http://localhost:3004/profile/${userData?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileUpdateData),
        }
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la modification du profil"
        );
      }

      // 2. Gérer le changement de rôle et les données spécifiques

      // Si le rôle a changé, supprimer les anciennes données
      if (formData.role !== userData?.roles_user) {
        // Supprimer les données étudiant si on passe à un autre rôle
        if (userData?.student && formData.role !== "student") {
          const deleteStudentResponse = await fetch(
            `http://localhost:3004/student/${userData.student.id}`,
            { method: "DELETE" }
          );
          if (!deleteStudentResponse.ok) {
            const errorData = await deleteStudentResponse.json();
            throw new Error(
              errorData.message ||
                "Erreur lors de la suppression des données étudiant"
            );
          }
        }

        // Supprimer les données conseiller si on passe à un autre rôle
        if (userData?.advisor && formData.role !== "advisor") {
          const deleteAdvisorResponse = await fetch(
            `http://localhost:3004/advisor/${userData.advisor.id}`,
            { method: "DELETE" }
          );
          if (!deleteAdvisorResponse.ok) {
            const errorData = await deleteAdvisorResponse.json();
            throw new Error(
              errorData.message ||
                "Erreur lors de la suppression des données conseiller"
            );
          }
        }
      }

      // 3. Mettre à jour ou créer les données selon le nouveau rôle
      if (formData.role === "student") {
        // Mettre à jour ou créer les données étudiant
        if (userData?.student) {
          // Mettre à jour l'étudiant existant
          const studentUpdateData = {
            id_promotion: getPromotionIdByName(formData.promotion || ""),
            major: formData.major,
          };

          const studentResponse = await fetch(
            `http://localhost:3004/student/${userData.student.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(studentUpdateData),
            }
          );

          if (!studentResponse.ok) {
            const errorData = await studentResponse.json();
            throw new Error(
              errorData.message ||
                "Erreur lors de la modification de l'étudiant"
            );
          }
        } else {
          // Créer un nouvel étudiant
          const studentCreateData = {
            id_user_profile: userData?.id,
            id_promotion: getPromotionIdByName(formData.promotion || ""),
            major: formData.major,
          };

          const studentResponse = await fetch(`http://localhost:3004/student`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(studentCreateData),
          });

          if (!studentResponse.ok) {
            const errorData = await studentResponse.json();
            throw new Error(
              errorData.message || "Erreur lors de la création de l'étudiant"
            );
          }
        }
      } else if (formData.role === "advisor") {
        // Mettre à jour ou créer les données conseiller
        if (userData?.advisor) {
          // Mettre à jour le conseiller existant
          const advisorUpdateData = {
            specialty: formData.major,
            room: formData.room,
            availability: formData.availability,
          };

          const advisorResponse = await fetch(
            `http://localhost:3004/advisor/${userData.advisor.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(advisorUpdateData),
            }
          );

          if (!advisorResponse.ok) {
            const errorData = await advisorResponse.json();
            throw new Error(
              errorData.message ||
                "Erreur lors de la modification du conseiller"
            );
          }
        } else {
          // Créer un nouveau conseiller
          const advisorCreateData = {
            id_user_profile: userData?.id,
            specialty: formData.major,
            room: formData.room,
            availability: formData.availability,
          };

          const advisorResponse = await fetch(`http://localhost:3004/advisor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(advisorCreateData),
          });

          if (!advisorResponse.ok) {
            const errorData = await advisorResponse.json();
            throw new Error(
              errorData.message || "Erreur lors de la création du conseiller"
            );
          }
        }
      }

      // 4. Mettre à jour l'utilisateur (email et mot de passe si nécessaire)
      if (
        userData?.id_user &&
        (formData.email !== userData?.originalEmail ||
          (isPasswordChange && formData.password))
      ) {
        const userUpdateData: any = {};

        // Ajouter l'email si il a changé
        if (formData.email !== userData?.originalEmail) {
          userUpdateData.email = formData.email;
        }

        // Ajouter le mot de passe si il a changé
        if (isPasswordChange && formData.password) {
          userUpdateData.password = formData.password;
        }

        // Faire l'appel API seulement si il y a des données à mettre à jour
        if (Object.keys(userUpdateData).length > 0) {
          const userId = userData?.id_user;
          if (!userId) {
            throw new Error("ID utilisateur non trouvé pour la modification");
          }

          const userResponse = await fetch(
            `http://localhost:3001/users/${userId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userUpdateData),
            }
          );

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(
              errorData.message ||
                "Erreur lors de la modification de l'utilisateur"
            );
          }
        }
      }

      // Redirection vers la page admin avec message de succès
      router.push("/admin/users/dashboard?message=user_updated");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setErrors({
        email:
          error instanceof Error
            ? error.message
            : "Erreur lors de la modification de l'utilisateur",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/users/dashboard");
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <ProjectHeader backIcon={<ArrowLeft />} />

      <div className="max-w-2xl mx-auto">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
                <p className="text-blue-100 text-sm">
                  Modifier les informations du compte utilisateur
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Sélection du rôle */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Type d'utilisateur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sélectionnez le type d'utilisateur
                  </p>
                </div>
              </div>

              <div
                className={`grid gap-4 ${
                  getAvailableRoles().length === 1
                    ? "grid-cols-1 md:grid-cols-1"
                    : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {getAvailableRoles().map((roleOption) => (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() =>
                      handleInputChange({
                        target: { name: "role", value: roleOption.value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      formData.role === roleOption.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          formData.role === roleOption.value
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {roleOption.icon}
                      </div>
                      <span
                        className={`font-medium text-sm ${
                          formData.role === roleOption.value
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {roleOption.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom"
                icon={User}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Prénom"
                error={errors.firstName}
                required
              />

              <Input
                label="Nom"
                icon={User}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Nom"
                error={errors.lastName}
                required
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@exemple.com"
                error={errors.email}
                required
              />

              <Input
                label="Téléphone"
                icon={Phone}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+33 6 12 34 56 78"
                error={errors.phone}
                required
              />
            </div>

            {/* Campus et Adresse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Campus"
                icon={Building}
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
                placeholder="Votre campus"
                error={errors.campus}
                required
              />

              <Input
                label="Adresse"
                icon={Home}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Adresse complète"
                error={errors.address}
              />
            </div>

            {/* Champs spécifiques aux étudiants */}
            {formData.role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PromotionDropdown
                  promotions={promotions as any}
                  selectedPromotion={formData.promotion || ""}
                  onPromotionChange={handlePromotionChange}
                  loading={promotionsLoading}
                  error={promotionsError || errors.promotion}
                  placeholder="Sélectionner une promotion"
                  required
                />

                <Input
                  label="Spécialité"
                  icon={BookOpen}
                  name="major"
                  value={formData.major || ""}
                  onChange={handleInputChange}
                  placeholder="Informatique"
                  error={errors.major}
                  required
                />
              </div>
            )}

            {/* Message d'erreur pour les promotions */}
            {formData.role === "student" && promotionsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  Erreur lors du chargement des promotions : {promotionsError}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Vous pouvez continuer en saisissant manuellement la promotion
                  dans le champ spécialité.
                </p>
              </div>
            )}

            {/* Champs spécifiques aux conseillers */}
            {formData.role === "advisor" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Spécialité"
                  icon={BookOpen}
                  name="major"
                  value={formData.major || ""}
                  onChange={handleInputChange}
                  placeholder="Informatique"
                  error={errors.major}
                  required
                />

                <Input
                  label="Salle"
                  icon={Building}
                  name="room"
                  value={formData.room || ""}
                  onChange={handleInputChange}
                  placeholder="A101"
                  error={errors.room}
                  required
                />

                <Input
                  label="Jours de présence"
                  icon={Calendar}
                  name="availability"
                  value={formData.availability || ""}
                  onChange={handleInputChange}
                  placeholder="Lundi, Mercredi, Vendredi"
                  error={errors.availability}
                  required
                />
              </div>
            )}

            {/* Séparateur */}
            <div className="border-t border-gray-200 pt-6 gap-4 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sécurité du compte
                  </h3>
                  <p className="text-sm text-gray-600">
                    Modifier le mot de passe (optionnel)
                  </p>
                </div>
              </div>

              {/* Option de changement de mot de passe */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasswordChange}
                    onChange={(e) => setIsPasswordChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Modifier le mot de passe
                  </span>
                </label>
              </div>

              {/* Mot de passe (conditionnel) */}
              {isPasswordChange && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PasswordInput
                    label="Nouveau mot de passe"
                    icon={Lock}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nouveau mot de passe"
                    error={errors.password}
                    required={isPasswordChange}
                  />

                  <PasswordInput
                    label="Confirmer le nouveau mot de passe"
                    icon={Lock}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirmez le nouveau mot de passe"
                    error={errors.confirmPassword}
                    required={isPasswordChange}
                  />
                </div>
              )}

              {/* Validation du mot de passe */}
              {isPasswordChange && formData.password && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Critères de sécurité :
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li
                      className={`flex items-center gap-2 ${
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.password.length >= 8
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins 8 caractères
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        /(?=.*[A-Z])/.test(formData.password)
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[A-Z])/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins une majuscule
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        /(?=.*[0-9])/.test(formData.password)
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[0-9])/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins un chiffre
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        formData.password === formData.confirmPassword &&
                        formData.confirmPassword
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.password === formData.confirmPassword &&
                          formData.confirmPassword
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Les mots de passe correspondent
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Modifier l'utilisateur
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;
