"use client";

import React from "react";
import { usePathname } from "next/navigation";

function BackgroundBubbles() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${
        !isHomePage && !isLoginPage && !isForgotPasswordPage
          ? "md:left-20 lg:left-64"
          : ""
      }`}
    >
      {/* Bulle 1 - Animation lente */}
      <div
        className="absolute w-24 h-24 bg-white/10 rounded-full animate-bubble-1"
        style={{
          left: "10%",
          top: "20%",
        }}
      ></div>

      {/* Bulle 2 - Animation moyenne */}
      <div
        className="absolute w-20 h-20 bg-white/10 rounded-full animate-bubble-2"
        style={{
          right: "15%",
          bottom: "30%",
        }}
      ></div>

      {/* Bulle 3 - Animation rapide */}
      <div
        className="absolute w-12 h-12 bg-white/10 rounded-full animate-bubble-3"
        style={{
          left: "60%",
          top: "50%",
        }}
      ></div>

      {/* Bulle 4 - Animation très lente */}
      <div
        className="absolute w-16 h-16 bg-white/10 rounded-full animate-bubble-4"
        style={{
          right: "40%",
          top: "10%",
        }}
      ></div>

      {/* Bulle 5 - Animation moyenne */}
      <div
        className="absolute w-14 h-14 bg-white/10 rounded-full animate-bubble-5"
        style={{
          left: "30%",
          bottom: "20%",
        }}
      ></div>
      {/* Bulle 6 - Animation rapide */}
      <div
        className="absolute w-10 h-10 bg-white/10 rounded-full animate-bubble-6"
        style={{
          right: "10%",
          top: "60%",
        }}
      ></div>

      {/* Bulle 7 - Très grande, animation très lente */}
      <div
        className="absolute w-32 h-32 bg-white/8 rounded-full animate-bubble-7"
        style={{
          left: "5%",
          top: "70%",
        }}
      ></div>

      {/* Bulle 8 - Moyenne, animation moyenne */}
      <div
        className="absolute w-20 h-20 bg-white/12 rounded-full animate-bubble-8"
        style={{
          right: "25%",
          top: "80%",
        }}
      ></div>

      {/* Bulle 9 - Petite, animation rapide */}
      <div
        className="absolute w-8 h-8 bg-white/15 rounded-full animate-bubble-9"
        style={{
          left: "80%",
          top: "15%",
        }}
      ></div>

      {/* Bulle 10 - Très petite, animation très rapide */}
      <div
        className="absolute w-6 h-6 bg-white/20 rounded-full animate-bubble-10"
        style={{
          right: "60%",
          bottom: "10%",
        }}
      ></div>

      {/* Bulle 11 - Grande, animation lente */}
      <div
        className="absolute w-28 h-28 bg-white/8 rounded-full animate-bubble-11"
        style={{
          left: "45%",
          top: "85%",
        }}
      ></div>

      {/* Bulle 12 - Moyenne, animation moyenne */}
      <div
        className="absolute w-22 h-22 bg-white/10 rounded-full animate-bubble-12"
        style={{
          right: "5%",
          top: "40%",
        }}
      ></div>

      {/* Bulle 13 - Très petite, animation très rapide */}
      <div
        className="absolute w-4 h-4 bg-white/25 rounded-full animate-bubble-1"
        style={{
          left: "70%",
          top: "90%",
        }}
      ></div>

      {/* Bulle 14 - Petite, animation rapide */}
      <div
        className="absolute w-7 h-7 bg-white/18 rounded-full animate-bubble-2"
        style={{
          right: "80%",
          bottom: "60%",
        }}
      ></div>

      {/* Bulle 15 - Moyenne, animation moyenne */}
      <div
        className="absolute w-16 h-16 bg-white/12 rounded-full animate-bubble-3"
        style={{
          left: "20%",
          top: "10%",
        }}
      ></div>
    </div>
  );
}

export default BackgroundBubbles;
