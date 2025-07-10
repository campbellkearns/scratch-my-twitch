/**
 * Application-wide types and utilities
 */

/**
 * Generic API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Form validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  PROFILE_NEW: '/profile/new',
  PROFILE_EDIT: '/profile/:id/edit',
  AUTH: '/auth',
  AUTH_CALLBACK: '/auth/callback'
} as const;

/**
 * Dynamic title placeholder types
 */
export type TitlePlaceholder = '{YYYY-MM-DD}' | '{DAY}';

/**
 * Application configuration
 */
export interface AppConfig {
  twitch: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
  storage: {
    dbName: string;
    dbVersion: number;
  };
}

/**
 * Theme configuration
 */
export interface Theme {
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    neutral: Record<string, string>;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: Record<string, string>;
  shadows: Record<string, string>;
}
