import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages publiques accessibles sans authentification
const publicPages = ['/', '/login', '/forgot-password']

// Pages d'authentification (redirection si déjà connecté)
const authPages = ['/login', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si c'est une page publique
  const isPublicPage = publicPages.includes(pathname)
  const isAuthPage = authPages.includes(pathname)

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('token')?.value

  // Si pas de token et pas une page publique, rediriger vers login
  if (!token && !isPublicPage) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si token présent et page d'auth, rediriger vers dashboard
  if (token && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - file.svg, globe.svg, etc. (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
