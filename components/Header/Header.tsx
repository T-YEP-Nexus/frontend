"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Bell } from "lucide-react";
import { Russo_One } from "next/font/google";
import NotificationList, { Notification } from "../NotificationList";

const font = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
});

interface HeaderProps {
  title?: string;
  description?: string;
}

const notificationsData: Notification[] = [
  {
    id: "1",
    title: "Nouveau message",
    message: "Vous avez reçu un nouveau message !",
    date: "2024-05-01 10:00",
    read: false,
  },
  {
    id: "2",
    title: "Mise à jour",
    message: "Une nouvelle version est disponible.",
    date: "2024-05-01 09:00",
    read: true,
  },
  {
    id: "3",
    title: "Rappel",
    message: "N'oubliez pas la réunion à 15h.",
    date: "2024-04-30 18:00",
    read: false,
  },
];

export default function Header({ title = "", description = "" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const notifBoxRef = useRef<HTMLDivElement>(null);

  // Fermer la liste si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifBoxRef.current &&
        !notifBoxRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notificationsData.filter((n) => !n.read).length;

  return (
    <div className="flex justify-between items-center mb-8 sm:mb-12 relative">
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
        <div className="relative">
          <button
            ref={bellRef}
            className="p-2 sm:p-3 cursor-pointer lg:hover:bg-white/10 text-white rounded-xl transition-all duration-300 relative"
            onClick={() => setOpen((o) => !o)}
          >
            <Bell size={20} className="sm:w-6 sm:h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
          {open && (
            <>
              {/* Overlay sombre pour faire ressortir les notifications */}
              <div className="fixed inset-0 bg-black/40 z-40" />
              <div
                ref={notifBoxRef}
                className="absolute right-0 mt-2 z-50 shadow-lg rounded-lg overflow-hidden"
                style={{ minWidth: 320 }}
              >
                <NotificationList notifications={notificationsData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
