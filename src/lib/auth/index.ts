/**
 * Authentication Module Index
 * 
 * Central export point for all authentication functionality
 */

// Core authentication class and functions
export {
  TwitchAuth,
  getTwitchAuth,
  isAuthenticated,
  startAuthFlow,
  handleAuthCallback,
  getCurrentUser,
  getValidToken,
  signOut,
  validateToken
} from './twitchAuth';

// Re-export types for convenience
export type {
  TwitchAuthToken,
  StoredAuthToken,
  OAuthState,
  TwitchUserResponse
} from '@/types/TwitchAPI';
