import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserIdFromToken } from '@/lib/auth'
import { getUserProfileData } from '@/lib/userData'

export const useRoleRedirect = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = getUserIdFromToken()
        if (!userId) {
          setIsLoading(false)
          return
        }

        // Récupérer le profil utilisateur pour obtenir le rôle
        const profileData = await getUserProfileData(userId)
        const userRole = profileData.roles_user

        // Obtenir le pathname actuel
        const pathname = window.location.pathname

        // Ne pas appliquer la redirection sur calendar ou documents
        if (pathname.startsWith('/calendar') || pathname.startsWith('/documents') || pathname.startsWith('/trombinoscope')) {
          setIsLoading(false)
          return
        }

        // Cas particulier : dashboard
        if (
          (userRole === 'admin' || userRole === 'advisor') &&
          pathname === '/dashboard'
        ) {
          console.log('Hook - Admin/advisor sur dashboard, redirection vers /admin')
          router.push('/admin')
          return
        }

        // Cas général : admin ou advisor sur une page client (hors /admin, /calendar, /documents)
        if (
          (userRole === 'admin' || userRole === 'advisor') &&
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/calendar') &&
          !pathname.startsWith('/documents') &&
          !pathname.startsWith('/trombinoscope')
        ) {
          console.log('Hook - Admin/advisor sur page client, redirection vers /admin' + pathname)
          const adminPath = '/admin' + pathname
          router.push(adminPath)
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error)
        setIsLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  return { isLoading }
}
