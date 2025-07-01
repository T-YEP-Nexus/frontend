import React from "react";
import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
});

function LandingCards(props: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 w-68 md:w-68 h-72 md:h-82 text-center shadow-lg shadow-black/20 lg:hover:shadow-xl transition-all duration-300 lg:hover:scale-105 select-none md:max-w-6xl">
      <div className="flex flex-col items-center justify-center gap-4">
        <img
          src={props.image}
          alt={props.title}
          className="size-20"
          style={{
            filter: "drop-shadow(0 0 10px rgba(0, 0, 0, 0.2))",
          }}
        />
        <h3
          className={`text-xl md:text-3xl font-bold text-[#0D3B8C] ${russoOne.className}`}
        >
          {props.title}
        </h3>
        <p className="text-sm md:text-md text-[#6B8CC2]">{props.description}</p>
      </div>
    </div>
  );
}

export default LandingCards;
