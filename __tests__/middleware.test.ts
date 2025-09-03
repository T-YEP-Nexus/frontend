/**
 * Tests unitaires pour le middleware d'authentification
 * Basé sur la structure des tests du profile-service
 */

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../middleware'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(() => ({ type: 'redirect' })),
    next: jest.fn(() => ({ type: 'next' })),
  },
}))

describe('Middleware d\'authentification', () => {
  let mockRequest: Partial<NextRequest>

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks()

    // Configuration de base du mock request
    mockRequest = {
      nextUrl: {
        pathname: '/dashboard',
      } as any,
      url: 'http://localhost:3000/dashboard',
      cookies: {
        get: jest.fn(),
      } as any,
    }
  })

  describe('Pages publiques', () => {
    it('devrait permettre l\'accès à la page d\'accueil sans token', () => {
      mockRequest.nextUrl!.pathname = '/'
      mockRequest.url = 'http://localhost:3000/'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('devrait permettre l\'accès à la page de login sans token', () => {
      mockRequest.nextUrl!.pathname = '/login'
      mockRequest.url = 'http://localhost:3000/login'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('devrait permettre l\'accès à la page forgot-password sans token', () => {
      mockRequest.nextUrl!.pathname = '/forgot-password'
      mockRequest.url = 'http://localhost:3000/forgot-password'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Redirection sans authentification', () => {
    it('devrait rediriger vers /login si pas de token et page protégée', () => {
      // Mock: pas de token
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue(undefined)

      mockRequest.nextUrl!.pathname = '/dashboard'
      mockRequest.url = 'http://localhost:3000/dashboard'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', mockRequest.url)
      )
    })

    it('devrait rediriger vers /login pour la page profile sans token', () => {
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue(undefined)

      mockRequest.nextUrl!.pathname = '/profile'
      mockRequest.url = 'http://localhost:3000/profile'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', mockRequest.url)
      )
    })

    it('devrait rediriger vers /login pour les pages admin sans token', () => {
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue(undefined)

      mockRequest.nextUrl!.pathname = '/admin/users'
      mockRequest.url = 'http://localhost:3000/admin/users'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', mockRequest.url)
      )
    })
  })

  describe('Redirection avec authentification', () => {
    it('devrait rediriger vers /dashboard si token présent et sur page de login', () => {
      // Mock: token présent
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue({ value: 'valid-token' })

      mockRequest.nextUrl!.pathname = '/login'
      mockRequest.url = 'http://localhost:3000/login'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/dashboard', mockRequest.url)
      )
    })

    it('devrait rediriger vers /dashboard si token présent et sur page forgot-password', () => {
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue({ value: 'valid-token' })

      mockRequest.nextUrl!.pathname = '/forgot-password'
      mockRequest.url = 'http://localhost:3000/forgot-password'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/dashboard', mockRequest.url)
      )
    })

    it('devrait permettre l\'accès aux pages protégées avec token', () => {
      ;(mockRequest.cookies!.get as jest.Mock).mockReturnValue({ value: 'valid-token' })

      mockRequest.nextUrl!.pathname = '/dashboard'
      mockRequest.url = 'http://localhost:3000/dashboard'

      const request = mockRequest as NextRequest
      const response = middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Gestion des cookies', () => {
    it('devrait vérifier la présence du cookie token', () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'test-token' })
      mockRequest.cookies = { get: mockGet } as any

      const request = mockRequest as NextRequest
      middleware(request)

      expect(mockGet).toHaveBeenCalledWith('token')
    })

    it('devrait gérer l\'absence de cookie token', () => {
      const mockGet = jest.fn().mockReturnValue(undefined)
      mockRequest.cookies = { get: mockGet } as any

      mockRequest.nextUrl!.pathname = '/dashboard'

      const request = mockRequest as NextRequest
      middleware(request)

      expect(mockGet).toHaveBeenCalledWith('token')
      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('Configuration du matcher', () => {
    it('devrait exclure les chemins API et statiques', () => {
      // Test que la configuration exclut les bons chemins
      const config = require('../middleware').config

      expect(config.matcher).toEqual([
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
      ])
    })
  })
})
