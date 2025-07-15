import React from "react";
import { LucideIcon } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <section
      className={`bg-white rounded-xl shadow-md border border-blue-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <h2 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg">
              <Icon className="w-4 h-4 text-blue-700" />
            </div>
          )}
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
};

export default ProfileSection;
