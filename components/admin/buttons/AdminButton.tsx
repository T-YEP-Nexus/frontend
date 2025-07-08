import React from "react";
import { Button } from "@/components/ui/button";

interface AdminButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function AdminButton({
  onClick,
  className = "",
  children,
  disabled = false,
  type = "button",
}: AdminButtonProps) {
  const defaultClassName =
    "group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border-0";

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${defaultClassName} ${className}`}
    >
      {children}
    </Button>
  );
}
