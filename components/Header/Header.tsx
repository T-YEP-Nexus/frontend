import React from "react";
import { MoreVertical, Bell } from "lucide-react";
import { Russo_One } from "next/font/google";

const font = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({ title = "", description = "" }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8 sm:mb-12">
      <div>
        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white ${font.className} mb-2`}
        >
          {title}
        </h1>
        <p className="text-white/80 text-base sm:text-lg">{description}</p>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300">
          <MoreVertical size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300">
          <Bell size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
