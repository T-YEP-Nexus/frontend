import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundBubbles from "@/components/Background/BackgroundBubbles";
import ConditionalSidebar from "@/components/Sidebar/ConditionalSidebar";
import ConditionalMain from "@/components/Layout/ConditionalMain";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus",
  description: "Nexus an project management tool for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <BackgroundBubbles />
        <ConditionalSidebar />
        <ConditionalMain>{children}</ConditionalMain>
      </body>
    </html>
  );
}
