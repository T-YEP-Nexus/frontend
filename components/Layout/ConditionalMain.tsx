"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

const ConditionalMain = ({ children }: ConditionalMainProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";

  return (
    <main
      className={`min-h-screen overflow-y-auto transition-all duration-300 ${
        isHomePage || isLoginPage || isForgotPasswordPage
          ? ""
          : "ml-20 md:ml-64"
      }`}
    >
      {children}
    </main>
  );
};

export default ConditionalMain;
