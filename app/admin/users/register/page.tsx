"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createCompleteUser, NewUserInput, ApiResponse } from "@/lib/userData";
import AdminLoading from "@/components/admin/AdminLoading";

interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  campus: string;
  role: "student" | "advisor" | "admin";
  promotion?: string;
  major?: string;
  room?: string;
  availability?: string;
  specialty?: string;
}

type UserRole = "student" | "advisor" | "admin";

const RegisterPage = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  // État du formulaire
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    confirmPassword: "",
    campus: "",
    specialty: "",
    role: "student",
    promotion: "",
    major: "",
    room: "",
    availability: "",
  });

  const [err, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Hook pour récupérer les promotions
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotionsData();

  // Fonction pour générer le numéro étudiant
  const generateStudentNumber = (
    lastName: string,
    promotion: string
  ): string => {
    const firstThreeLetters = lastName.toUpperCase().substring(0, 3);
    const promotionUpper = promotion.toUpperCase();
    return `${firstThreeLetters}-${promotionUpper}`;
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const apiData: NewUserInput = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
        campus: formData.campus,
        is_active: true,
        roles_user: formData.role,
        promotion: formData.promotion,
        specialty: formData.specialty,
        room: formData.room,
        major: formData.major,
        availability: formData.availability,
      };

      // Ajouter les champs spécifiques selon le rôle
      if (formData.role === "student") {
        apiData.student_number = generateStudentNumber(
          formData.last_name,
          formData.promotion || ""
        );
      }
      await createCompleteUser(apiData);
      setSuccess(true);

      // Redirection avec message de succès
      router.push("/admin?message=user_created");
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      setError(error.message || "Erreur lors de la création du compte");
    } finally {
      setIsSaving(false);
    }
  };

  const { userData, loading, error, updateProfileImageUrl } = useUserData(
    getUserIdFromToken()
  );

  // Récupérer le rôle de l'utilisateur connecté
  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userId = getUserIdFromToken();
        if (userId) {
          const profileData = await getUserProfileData(userId);
          setUserRole(profileData.roles_user);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  // Vérifier que l'utilisateur a les droits d'accès
  React.useEffect(() => {
    if (!isLoading && userRole && !["admin", "advisor"].includes(userRole)) {
      router.push("/dashboard?error=unauthorized");
    }
  }, [userRole, isLoading, router]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return <AdminLoading message="Vérification des droits d'accès..." />;
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

    if (userRole === "admin") {
      return allRoles;
    }

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
    if (errors[name as keyof RegisterFormData]) {
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
    const newErrors: Partial<RegisterFormData> = {};

    // Validation prénom
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation nom
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = "Le nom doit contenir au moins 2 caractères";
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

    // // Validation mot de passe
    // if (!formData.password) {
    //   newErrors.password = "Le mot de passe est requis";
    // } else if (formData.password.length < 8) {
    //   newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    // } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    //   newErrors.password = "Le mot de passe doit contenir au moins une majuscule";
    // } else if (!/(?=.*[0-9])/.test(formData.password)) {
    //   newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
    // }

    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <ProjectHeader backIcon={<ArrowLeft />} />

      <div className="max-w-2xl mx-auto">
        {/* Affichage des erreurs */}
        {err && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{err}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Créer un utilisateur</h2>
                <p className="text-blue-100 text-sm">
                  Créer un nouveau compte utilisateur
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitUser} className="p-6 space-y-6">
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
                    Sélectionnez le type d'utilisateur à créer
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
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Prénom"
                error={errors.first_name}
                required
              />

              <Input
                label="Nom"
                icon={User}
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Nom"
                error={errors.last_name}
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

            {/* Adresse et Campus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Adresse"
                icon={Building}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Votre adresse"
                error={errors.address}
              />

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
            </div>

            {/* Champs spécifiques aux étudiants */}
            {formData.role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PromotionDropdown
                  promotions={promotions}
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
                  name="specialty"
                  value={formData.specialty || ""}
                  onChange={handleInputChange}
                  placeholder="Informatique"
                  error={errors.specialty}
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
              </div>

              {/* Mot de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordInput
                  label="Mot de passe"
                  icon={Lock}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  error={errors.password}
                  required
                />

                <PasswordInput
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez le mot de passe"
                  error={errors.confirmPassword}
                  required
                />
              </div>

              {/* Validation du mot de passe */}
              {/* {formData.password && (
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
              )} */}
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
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Créer l'utilisateur
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

export default RegisterPage;
