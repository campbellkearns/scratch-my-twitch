import type { AppConfig } from '@/types'

/**
 * Application configuration
 * Environment variables should be set in production
 */
export const config: AppConfig = {
  twitch: {
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_TWITCH_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    scopes: [
      'channel:manage:broadcast', // Required to update stream info
      'user:read:email'           // Optional: for user info
    ]
  },
  storage: {
    dbName: 'scratch-my-twitch',
    dbVersion: 1
  }
}

/**
 * Dynamic title placeholder resolver
 */
export const resolveTitlePlaceholders = (title: string): string => {
  const now = new Date()
  
  return title
    .replace('{YYYY-MM-DD}', now.toISOString().split('T')[0])
    .replace('{DAY}', now.toLocaleDateString('en-US', { weekday: 'long' }))
}

/**
 * Validate if a string contains valid title placeholders
 */
export const isValidTitleTemplate = (title: string): boolean => {
  const validPlaceholders = ['{YYYY-MM-DD}', '{DAY}']
  const placeholderRegex = /{[^}]+}/g
  const matches = title.match(placeholderRegex) || []
  
  return matches.every(match => validPlaceholders.includes(match))
}

/**
 * Generate a unique ID for profiles
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
