"use client";

import React from "react";
import { usePathname } from "next/navigation";
// plus de dépendance au rôle ici, la grille gère l'espace

interface ConditionalMainProps {
  children: React.ReactNode;
}

const ConditionalMain = ({ children }: ConditionalMainProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";
  // pages full-width (sans sidebar)

  return (
    <main
      className={`min-h-screen overflow-y-auto transition-all duration-300 ${
        isHomePage || isLoginPage || isForgotPasswordPage ? "lg:col-span-2" : ""
      }`}
    >
      {children}
    </main>
  );
};

export default ConditionalMain;
