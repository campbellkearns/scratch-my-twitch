/**
 * Twitch API Type Definitions
 * 
 * Type definitions for Twitch API requests and responses, designed to support
 * the core functionality needed for stream profile management.
 */

/**
 * OAuth 2.0 token structure from Twitch
 */
export interface TwitchAuthToken {
  /** Bearer token for API requests */
  access_token: string;
  /** Token type (always "bearer" for Twitch) */
  token_type: string;
  /** Token expiration time in seconds */
  expires_in: number;
  /** Refresh token for obtaining new access tokens */
  refresh_token?: string;
  /** Scopes granted to this token */
  scope?: string[];
}

/**
 * Stored token with additional metadata
 */
export interface StoredAuthToken extends TwitchAuthToken {
  /** When this token was obtained */
  obtainedAt: Date;
  /** Calculated expiration date */
  expiresAt: Date;
  /** User ID this token belongs to */
  userId: string;
}

/**
 * OAuth state for PKCE flow
 */
export interface OAuthState {
  /** State parameter for security */
  state: string;
  /** Code verifier for PKCE */
  codeVerifier: string;
  /** Code challenge for PKCE */
  codeChallenge: string;
  /** Redirect URI used */
  redirectUri: string;
  /** Timestamp when flow started */
  createdAt: Date;
}

/**
 * Twitch API Game/Category response
 */
export interface TwitchGameResponse {
  /** Unique game/category ID */
  id: string;
  /** Game/category name */
  name: string;
  /** Box art URL template */
  box_art_url: string;
  /** IGDB ID reference */
  igdb_id: string;
}

/**
 * Cached category with expiration
 */
export interface CachedCategory {
  /** Twitch category ID */
  id: string;
  /** Category name */
  name: string;
  /** Box art URL */
  boxArtUrl?: string;
  /** When this was cached */
  cachedAt: Date;
  /** When this cache expires */
  expiresAt: Date;
  /** Search terms for offline filtering */
  searchTerms: string[];
}

/**
 * Twitch API Channel Information response
 */
export interface TwitchChannelResponse {
  /** Broadcaster user ID */
  broadcaster_id: string;
  /** Broadcaster login name */
  broadcaster_login: string;
  /** Broadcaster display name */
  broadcaster_name: string;
  /** Broadcaster language */
  broadcaster_language: string;
  /** Current game/category ID */
  game_id: string;
  /** Current game/category name */
  game_name: string;
  /** Current stream title */
  title: string;
  /** Stream delay in seconds */
  delay: number;
  /** Current stream tags */
  tags: string[];
  /** Content classification labels */
  content_classification_labels: string[];
  /** Whether this is branded content */
  is_branded_content: boolean;
}

/**
 * Request payload for updating channel information
 */
export interface UpdateChannelRequest {
  /** New game/category ID */
  game_id?: string;
  /** New stream title */
  title?: string;
  /** New broadcaster language */
  broadcaster_language?: string;
  /** New stream tags (max 10) */
  tags?: string[];
  /** Content classification labels */
  content_classification_labels?: string[];
  /** Branded content flag */
  is_branded_content?: boolean;
}

/**
 * Twitch API Games search response
 */
export interface TwitchGamesSearchResponse {
  /** Array of games matching search */
  data: TwitchGameResponse[];
  /** Pagination cursor */
  pagination?: {
    cursor?: string;
  };
}

/**
 * Twitch API Channel response wrapper
 */
export interface TwitchChannelInfoResponse {
  /** Channel data array (typically single item) */
  data: TwitchChannelResponse[];
}

/**
 * Twitch API User information
 */
export interface TwitchUserResponse {
  /** User ID */
  id: string;
  /** Login name */
  login: string;
  /** Display name */
  display_name: string;
  /** User type */
  type: string;
  /** Broadcaster type */
  broadcaster_type: string;
  /** User description */
  description: string;
  /** Profile image URL */
  profile_image_url: string;
  /** Offline image URL */
  offline_image_url: string;
  /** View count */
  view_count: number;
  /** Account creation date */
  created_at: string;
}

/**
 * Twitch API User response wrapper
 */
export interface TwitchUserInfoResponse {
  /** User data array */
  data: TwitchUserResponse[];
}

/**
 * API Error response from Twitch
 */
export interface TwitchAPIError {
  /** Error type */
  error: string;
  /** HTTP status code */
  status: number;
  /** Human-readable message */
  message: string;
}

/**
 * Rate limit information from Twitch API headers
 */
export interface TwitchRateLimit {
  /** Rate limit for this endpoint */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp when limit resets */
  reset: number;
}

/**
 * API Request configuration
 */
export interface TwitchAPIConfig {
  /** Base URL for Twitch API */
  baseUrl: string;
  /** Client ID for API requests */
  clientId: string;
  /** Current access token */
  accessToken?: string;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Health check response
 */
export interface TwitchAPIHealthCheck {
  /** Whether API is available */
  isAvailable: boolean;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Error message if unavailable */
  error?: string;
  /** Timestamp of check */
  checkedAt: Date;
}

/**
 * Scopes required for different operations
 */
export const TWITCH_SCOPES = {
  /** Read channel information */
  CHANNEL_READ: 'channel:read:subscriptions',
  /** Modify channel information */
  CHANNEL_MANAGE: 'channel:manage:broadcast',
  /** Read user information */
  USER_READ: 'user:read:email'
} as const;

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  /** Category cache duration (24 hours) */
  CATEGORIES_TTL: 24 * 60 * 60 * 1000,
  /** User info cache duration (1 hour) */
  USER_INFO_TTL: 60 * 60 * 1000,
  /** Health check cache duration (5 minutes) */
  HEALTH_CHECK_TTL: 5 * 60 * 1000
} as const;
