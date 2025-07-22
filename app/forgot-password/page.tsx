"use client";

import { useState } from "react";
import LogoAndTitle from "@/components/Login/LogoAndTitle";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulation d'envoi d'email (à remplacer par l'appel API réel)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Pour l'instant, on simule un succès
      setIsSuccess(true);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center relative overflow-hidden">
      {/* Bulles de fond animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-32 h-32 bg-white/10 rounded-full animate-bubble-1"
          style={{ left: "10%", top: "20%" }}
        ></div>
        <div
          className="absolute w-24 h-24 bg-white/10 rounded-full animate-bubble-2"
          style={{ right: "15%", bottom: "30%" }}
        ></div>
        <div
          className="absolute w-16 h-16 bg-white/10 rounded-full animate-bubble-3"
          style={{ left: "60%", top: "50%" }}
        ></div>
        <div
          className="absolute w-20 h-20 bg-white/10 rounded-full animate-bubble-4"
          style={{ right: "40%", top: "10%" }}
        ></div>
        <div
          className="absolute w-12 h-12 bg-white/10 rounded-full animate-bubble-5"
          style={{ left: "30%", bottom: "20%" }}
        ></div>
        <div
          className="absolute w-28 h-28 bg-white/8 rounded-full animate-bubble-6"
          style={{ right: "10%", top: "60%" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <LogoAndTitle title="Mot de passe oublié" />
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          {!isSuccess ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Réinitialisation
                </h2>
                <p className="text-gray-600 text-sm">
                  Renseigne ton adresse e-mail pour recevoir un lien de
                  réinitialisation
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                {/* Champ email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="exemple@epitech.eu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* État de succès */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email envoyé !
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à{" "}
                <strong>{email}</strong>. Vérifie ta boîte mail et clique sur le
                lien pour créer un nouveau mot de passe.
              </p>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm">
                <p className="font-medium mb-1">💡 Conseils :</p>
                <ul className="text-left space-y-1">
                  <li>• Vérifie tes spams si tu ne vois pas l'email</li>
                  <li>• Le lien expire dans 24h</li>
                  <li>• Contacte le support si tu as des problèmes</li>
                </ul>
              </div>
            </div>
          )}

          {/* Lien retour */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            © 2024 Nexus. Tous droits réservés.
          </p>
        </div>
      </div>
    </main>
  );
}
