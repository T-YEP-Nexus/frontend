import React from "react";

interface ResourceCardProps {
  name: string;
  action: string;
  url: string;
}

export default function ResourceCard({ name, action, url }: ResourceCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors flex flex-col items-start gap-2 shadow-sm">
      <p className="font-medium text-gray-800 text-sm mb-1">{name}</p>
      <div className="flex gap-2 w-full">
        {["Voir", "view"].includes(action) && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-md text-xs font-medium transition-all duration-200 text-center"
          >
            Voir
          </a>
        )}
        {["Télécharger", "download"].includes(action) && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-1.5 border border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 rounded-md text-xs font-medium transition-all duration-200 text-center"
          >
            Télécharger
          </a>
        )}
      </div>
    </div>
  );
}
