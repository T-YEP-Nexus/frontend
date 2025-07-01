"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const ConditionalSidebar = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";

  if (isHomePage || isLoginPage || isForgotPasswordPage) {
    return null;
  }

  return <Sidebar />;
};

export default ConditionalSidebar;
