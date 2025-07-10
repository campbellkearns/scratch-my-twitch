/**
 * Twitch API response types
 */

/**
 * Twitch OAuth token response
 */
export interface TwitchTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string[];
  token_type: 'bearer';
}

/**
 * Twitch user information
 */
export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

/**
 * Twitch game/category information
 */
export interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

/**
 * Twitch channel information
 */
export interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
  tags: string[];
}

/**
 * Twitch API error response
 */
export interface TwitchError {
  error: string;
  status: number;
  message: string;
}

/**
 * Twitch API generic response wrapper
 */
export interface TwitchApiResponse<T> {
  data: T[];
  pagination?: {
    cursor?: string;
  };
}

/**
 * Update channel information request payload
 */
export interface UpdateChannelRequest {
  game_id?: string;
  broadcaster_language?: string;
  title?: string;
  delay?: number;
  tags?: string[];
}

/**
 * Search categories request parameters
 */
export interface SearchCategoriesParams {
  query: string;
  first?: number;
  after?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: TwitchUser | null;
  expiresAt: Date | null;
}
