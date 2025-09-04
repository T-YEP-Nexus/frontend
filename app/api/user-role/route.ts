import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Enlever "Bearer "

    // Décoder le token pour obtenir l'ID utilisateur
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const userId = decoded.userId

    // Appeler l'API profile pour récupérer le rôle
    const profileResponse = await fetch(`http://localhost:3004/profile/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Erreur lors de la récupération du profil' }, { status: 500 })
    }

    const profileData = await profileResponse.json()
    const userRole = profileData.data.roles_user

    return NextResponse.json({ role: userRole })
  } catch (error) {
    console.error('Erreur dans user-role API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
