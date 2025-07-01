import React from "react";
import Link from "next/link";
import { Russo_One } from "next/font/google";

const font = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

interface ProjectHeaderProps {
  title?: string;
  description?: string;
  backHref: string;
  backIcon: React.ReactNode;
  className?: string;
}

export default function ProjectHeader({
  title,
  description,
  backHref,
  backIcon,
  className = "",
}: ProjectHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-8 ${className}`}>
      <Link
        href={backHref}
        className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300"
      >
        {backIcon}
      </Link>
      <div>
        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white ${font.className} mb-2`}
        >
          {title}
        </h1>
        {description && (
          <p className="text-white/80 text-base sm:text-lg mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
