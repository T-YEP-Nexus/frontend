"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoAndTitle from "@/components/Login/LogoAndTitle";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3001/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Stocker le token dans les cookies pour le middleware
        document.cookie = `token=${data.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Debug: afficher les données utilisateur
        console.log("Données de connexion:", data);
        console.log("Utilisateur:", data.data.user);

        // Récupérer le profil utilisateur pour obtenir le rôle
        try {
          const profileResponse = await fetch(
            `http://localhost:3004/profile/user/${data.data.user.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("Données du profil:", profileData);

            const userRole = profileData.data.roles_user;
            console.log("Rôle utilisateur:", userRole);

            // Rediriger selon le rôle de l'utilisateur
            console.log(
              `Rôle détecté: ${userRole}, redirection vers:`,
              userRole === "admin" || userRole === "advisor"
                ? "/admin"
                : "/dashboard"
            );

            if (userRole === "admin" || userRole === "advisor") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          } else {
            console.error("Erreur lors de la récupération du profil");
            // Redirection par défaut vers le dashboard étudiant
            router.push("/dashboard");
          }
        } catch (profileError) {
          console.error(
            "Erreur lors de la récupération du profil:",
            profileError
          );
          // Redirection par défaut vers le dashboard étudiant
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Erreur de connexion");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
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
          <LogoAndTitle title="Nexus - Connexion" />
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue</h2>
            <p className="text-gray-600 text-sm">
              Connecte-toi à ton espace personnel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            {/* Champ mot de passe */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ton mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Lien mot de passe oublié */}
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              Mot de passe oublié ?
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
