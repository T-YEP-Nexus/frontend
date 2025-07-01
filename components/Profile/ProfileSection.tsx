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
    <section className={`bg-white rounded-xl shadow p-6 ${className}`}>
      <h2 className="font-bold text-xl text-blue-900 mb-4 flex items-center gap-2">
        {Icon && <Icon className="w-6 h-6" />}
        {title}
      </h2>
      {children}
    </section>
  );
};

export default ProfileSection;
