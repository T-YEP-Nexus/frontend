"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { useUserData } from "@/hooks/useUserData";
import ProjectHeader from "@/components/Projects/ProjectHeader/ProjectHeader";
import { getUserIdFromToken } from "@/lib/auth";
import AdminLoading from "@/components/admin/AdminLoading";

const EditProfilePage = () => {
  const router = useRouter();
  const currentUserId = getUserIdFromToken();
  const { userData, loading, error, updateUserData } =
    useUserData(currentUserId);
  const [isSaving, setIsSaving] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    campus: "",
    promotion: "",
    role: "",
  });

  // État pour le mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialiser les données du formulaire quand userData est chargé
  React.useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        campus: userData.campus || "",
        promotion: userData.promotion || "",
        role: userData.role || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUserData(formData);

      // Debug: afficher le rôle pour vérifier
      console.log("=== DEBUG REDIRECTION ===");
      console.log("userData:", userData);
      console.log("userData?.role:", userData?.role);
      console.log(
        "Condition admin/advisor:",
        userData?.role === "admin" || userData?.role === "advisor"
      );
      console.log(
        "Redirection vers:",
        userData?.role === "admin" || userData?.role === "advisor"
          ? "/admin/profile"
          : "/profile"
      );
      console.log("========================");

      const redirectUrl =
        userData?.role === "admin" || userData?.role === "advisor"
          ? "/admin/profile"
          : "/profile";

      console.log("Redirection forcée vers:", redirectUrl);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Debug: afficher le rôle pour vérifier
    console.log("=== DEBUG CANCEL REDIRECTION ===");
    console.log("userData:", userData);
    console.log("userData?.role:", userData?.role);
    console.log(
      "Condition admin/advisor:",
      userData?.role === "admin" || userData?.role === "advisor"
    );
    console.log(
      "Redirection vers:",
      userData?.role === "admin" || userData?.role === "advisor"
        ? "/admin/profile"
        : "/profile"
    );
    console.log("========================");

    const redirectUrl =
      userData?.role === "admin" || userData?.role === "advisor"
        ? "/admin/profile"
        : "/profile";

    console.log("Redirection forcée vers:", redirectUrl);
    window.location.href = redirectUrl;
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <AdminLoading message="Chargement du profil..." />
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error || !userData) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Erreur lors du chargement du profil
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
      <ProjectHeader backIcon={<ArrowLeft />} />

      <div className="max-w-2xl mx-auto">
        {/* Formulaire modernisé */}
        <div className="bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              Informations personnelles
            </h2>
            <p className="text-blue-600 text-sm mt-1">
              Modifiez vos données de profil
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                icon={User}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                required
              />

              <Input
                label="Nom"
                icon={User}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Votre nom"
                required
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@exemple.com"
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
                required
              />
            </div>

            {/* Informations académiques (désactivées) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Campus"
                icon={Building}
                name="campus"
                value={formData.campus}
                disabled
                placeholder="Votre campus"
              />

              <Input
                label="Promotion"
                icon={GraduationCap}
                name="promotion"
                value={formData.promotion}
                disabled
                placeholder="2024"
              />
            </div>

            {/* Rôle (désactivé) */}
            <Input
              label="Rôle"
              icon={User}
              name="role"
              value={formData.role}
              disabled
              placeholder="Étudiant"
            />

            {/* Séparateur */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-purple-200 rounded-lg">
                  <Lock size={16} className="text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Modifier le mot de passe
                  </h3>
                  <p className="text-xs text-gray-600">
                    Changez votre mot de passe pour sécuriser votre compte
                  </p>
                </div>
              </div>

              {/* Mot de passe actuel */}
              <PasswordInput
                label="Mot de passe actuel"
                icon={Lock}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Entrez votre mot de passe actuel"
              />

              {/* Nouveau mot de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <PasswordInput
                  label="Nouveau mot de passe"
                  icon={Lock}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nouveau mot de passe"
                />

                <PasswordInput
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>

              {/* Validation du mot de passe */}
              {passwordData.newPassword && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-medium text-blue-900 mb-2">
                    Critères de sécurité :
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li
                      className={`flex items-center gap-2 ${
                        passwordData.newPassword.length >= 8
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          passwordData.newPassword.length >= 8
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins 8 caractères
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        /[A-Z]/.test(passwordData.newPassword)
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[A-Z]/.test(passwordData.newPassword)
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins une majuscule
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        /[0-9]/.test(passwordData.newPassword)
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          /[0-9]/.test(passwordData.newPassword)
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      Au moins un chiffre
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        passwordData.newPassword ===
                          passwordData.confirmPassword &&
                        passwordData.confirmPassword
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          passwordData.newPassword ===
                            passwordData.confirmPassword &&
                          passwordData.confirmPassword
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

            {/* Actions modernisées */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1 h-12 text-sm font-medium border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
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

export default EditProfilePage;
