"use client";

import React, { useState } from "react";

const NexusAnimated: React.FC<{ className?: string }> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1200px)").matches;

  const handleMouseEnter = () => {
    if (isDesktop()) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isDesktop()) setIsHovered(false);
  };

  return (
    <img
      src={isHovered ? "/images/NexusClin.png" : "/images/Nexus.png"}
      alt="Logo Nexus animé"
      className={`max-md:size-3/4 size-full object-contain animate-balance transition-transform duration-300 lg:hover:rotate-360 lg:hover:scale-125 ${className}`}
      style={{
        filter: "drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable={false}
    />
  );
};

export default NexusAnimated;
