"use client";

import React, { useState } from "react";
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

const EditProfilePage = () => {
  const router = useRouter();
  const { userData, loading, error, updateUserData } = useUserData();
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
      router.push("/profile");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
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
      <ProjectHeader
        backHref="/profile"
        backIcon={<ArrowLeft />}
      />

      <div className="max-w-2xl mx-auto">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Informations personnelles</h2>
                <p className="text-blue-100 text-sm">
                  Modifiez vos données de profil
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="border-t border-gray-200 pt-6 gap-4 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifier le mot de passe
                  </h3>
                  <p className="text-sm text-gray-600">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Critères de sécurité :
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li
                      className={`flex items-center gap-2 ${
                        passwordData.newPassword.length >= 8
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
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
                        className={`w-2 h-2 rounded-full ${
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
                        className={`w-2 h-2 rounded-full ${
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
                        className={`w-2 h-2 rounded-full ${
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

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
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
