import React from "react";
import ResourceCard from "@/components/Projects/Details/Ressources/ResourceCard";

interface Resource {
  name: string;
  action: string;
  url: string;
}

interface ResourceSectionProps {
  title: string;
  icon: React.ReactNode;
  resources: Resource[];
}

export default function ResourceSection({
  title,
  icon,
  resources,
}: ResourceSectionProps) {
  return (
    <div className="p-5 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm mb-4">
      <h3 className="flex items-center gap-2 text-blue-700 font-semibold text-lg mb-4 py-1">
        <span className="inline-block">{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard
            key={index}
            name={resource.name}
            action={resource.action}
            url={resource.url}
          />
        ))}
      </div>
    </div>
  );
}
