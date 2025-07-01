import React from "react";
import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
});

function LandingFooter() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 text-white pb-20 pt-10 md:max-w-6xl mx-auto max-xl:px-10">
      <div className="bg-[#034C8C] md:w-1/2 w-62 h-72 md:h-56 flex flex-col p-6 rounded-xl gap-10 shadow-lg shadow-black/20 select-none lg:hover:scale-105 transition-all duration-300">
        <h1 className={`text-3xl font-bold ${russoOne.className}`}>
          Et demain ?
        </h1>
        <p className="text-xl">
          Nexus deviendra une plateforme adaptable à tous les établissements et
          formations.
        </p>
      </div>
      <div className="bg-[#034C8C] md:w-1/2 w-62 h-72 md:h-56 flex flex-col p-6 rounded-xl gap-10 shadow-lg shadow-black/20 select-none lg:hover:scale-105 transition-all duration-300">
        <h1 className={`text-3xl font-bold ${russoOne.className}`}>
          Projet étudiant
        </h1>
        <p className="text-xl">
          Développé par des étudiants pour des étudiants
        </p>
      </div>
    </div>
  );
}

export default LandingFooter;
