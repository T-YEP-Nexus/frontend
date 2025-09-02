"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { useUserData } from "@/hooks/useUserData";

interface ConditionalMainProps {
  children: React.ReactNode;
}

const ConditionalMain = ({ children }: ConditionalMainProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";
  const userId = getUserIdFromToken();
  const { userData } = useUserData(userId);
  const isStudent = userData?.role === "student";

  return (
    <main
      className="min-h-screen overflow-y-auto transition-all duration-300"
    >
      {children}
    </main>
  );
};

export default ConditionalMain;
