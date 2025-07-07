import { Loader2 } from "lucide-react";
import React from "react";

export default function AdminLoading({
  message = "Chargement...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-white/90 to-blue-100/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6 p-10 rounded-3xl shadow-2xl bg-white/80 border border-blue-200/40 scale-100 animate-pop-in">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin-slow drop-shadow-lg" />
        <div className="w-48 h-4 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-300 rounded-full animate-skeleton mb-2" />
        <p className="text-2xl font-bold text-blue-900 drop-shadow-sm tracking-wide animate-pulse-slow text-center">
          {message}
        </p>
      </div>
      <style jsx global>{`
        @keyframes skeleton {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        .animate-skeleton {
          background-size: 200px 100%;
          background-repeat: no-repeat;
          animation: skeleton 1.2s linear infinite;
        }
        @keyframes pop-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes spin-slow {
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 1.2s linear infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
