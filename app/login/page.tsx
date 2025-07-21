"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoAndTitle from "@/components/Login/LogoAndTitle";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
    <main className="h-screen flex items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center z-10">
        <LogoAndTitle title="Connecte-toi à Nexus" />

        <div className="bg-white p-12 rounded-xl shadow-md w-[500px] text-center mt-8">
          <form onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input placeholder-gray-600"
              required
              disabled={isLoading}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-4 placeholder-gray-600"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              className="button mt-6 cursor-pointer transition-all duration-300 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Connexion"}
            </button>
          </form>

          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 mt-4 block hover:underline hover:text-blue-800"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </main>
  );
}
