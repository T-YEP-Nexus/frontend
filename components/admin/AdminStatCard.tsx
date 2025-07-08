import React from "react";

interface AdminStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBgClassName?: string;
}

export default function AdminStatCard({
  title,
  value,
  icon,
  iconBgClassName = "bg-gradient-to-br from-blue-100 to-blue-200",
}: AdminStatCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg p-6 border border-blue-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 ">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${iconBgClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
