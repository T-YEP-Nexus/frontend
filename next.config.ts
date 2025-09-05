import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  // Désactiver complètement les indicateurs de développement
  devIndicators: false,
  // Masquer les informations de build
  poweredByHeader: false,
  // Désactiver les warnings de développement
  onDemandEntries: {
    // période en ms pendant laquelle on garde les pages en mémoire
    maxInactiveAge: 25 * 1000,
    // nombre de pages qui devraient être gardées simultanément
    pagesBufferLength: 2,
  },
  // Configuration pour masquer les erreurs en développement
  experimental: {
    // Désactiver les warnings de performance
    optimizeCss: false,
  },
};

export default nextConfig;
