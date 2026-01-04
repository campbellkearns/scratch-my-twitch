/**
 * Twitch OAuth 2.0 Authentication
 *
 * Implements secure OAuth 2.0 implicit grant flow for Twitch API access.
 * Handles token storage, validation, and user authentication for browser-based apps.
 * Note: Implicit flow does not support token refresh - users must re-authenticate when tokens expire.
 */

import { getDB } from '@/lib/db/indexedDB';
import { TWITCH_ENDPOINTS, TWITCH_CONFIG, STORAGE_KEYS, API_CONFIG, ERROR_CODES, FEATURE_FLAGS } from '@/types/constants';
import { 
  TwitchAuthToken, 
  StoredAuthToken, 
  OAuthState, 
  TwitchUserResponse,
  TwitchUserInfoResponse
} from '@/types/TwitchAPI';

/**
 * Authentication state manager for Twitch OAuth
 */
export class TwitchAuth {
  private static instance: TwitchAuth | null = null;
  private currentToken: StoredAuthToken | null = null;
  private currentUser: TwitchUserResponse | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TwitchAuth {
    if (!TwitchAuth.instance) {
      TwitchAuth.instance = new TwitchAuth();
    }
    return TwitchAuth.instance;
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return token !== null && this.isTokenValid(token);
    } catch (error) {
      this.logError('Error checking authentication status', error);
      return false;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<TwitchUserResponse | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const token = await this.getValidToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${TWITCH_ENDPOINTS.API_BASE}${TWITCH_ENDPOINTS.USERS}`, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Client-Id': TWITCH_CONFIG.CLIENT_ID,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userData: TwitchUserInfoResponse = await response.json();
      if (userData.data && userData.data.length > 0) {
        this.currentUser = userData.data[0];
        return this.currentUser;
      }

      return null;
    } catch (error) {
      this.logError('Error fetching current user', error);
      return null;
    }
  }

  /**
   * Start OAuth 2.0 implicit grant flow
   */
  async startAuthFlow(): Promise<void> {
    if (!TWITCH_CONFIG.CLIENT_ID) {
      throw new Error('Twitch Client ID not configured. Check your environment variables.');
    }

    try {
      // Generate state for CSRF protection
      const state = this.generateRandomString(32);

      // Store OAuth state
      const oauthState: OAuthState = {
        state,
        redirectUri: TWITCH_CONFIG.REDIRECT_URI,
        createdAt: new Date(),
      };

      await this.storeOAuthState(oauthState);

      // Build authorization URL for implicit flow
      const params = new URLSearchParams({
        client_id: TWITCH_CONFIG.CLIENT_ID,
        redirect_uri: TWITCH_CONFIG.REDIRECT_URI,
        response_type: TWITCH_CONFIG.RESPONSE_TYPE,
        scope: TWITCH_CONFIG.REQUIRED_SCOPES.join(' '),
        state: state,
      });

      const authUrl = `${TWITCH_CONFIG.AUTH_URL}?${params.toString()}`;

      this.log('Starting OAuth flow', { authUrl, state });

      // Redirect to Twitch authorization
      window.location.href = authUrl;
    } catch (error) {
      this.logError('Error starting auth flow', error);
      throw new Error('Failed to start authentication flow');
    }
  }

  /**
   * Handle OAuth callback from implicit grant flow
   */
  async handleAuthCallback(url: string): Promise<boolean> {
    try {
      // In implicit flow, tokens are in URL fragment (hash), not query params
      const urlObj = new URL(url);
      const hashParams = new URLSearchParams(urlObj.hash.substring(1)); // Remove '#' prefix

      const accessToken = hashParams.get('access_token');
      const tokenType = hashParams.get('token_type');
      const expiresIn = hashParams.get('expires_in');
      const scope = hashParams.get('scope');
      const state = hashParams.get('state');
      const error = hashParams.get('error');

      // Check for authorization errors
      if (error) {
        const errorDescription = hashParams.get('error_description');
        throw new Error(`Authorization failed: ${error}${errorDescription ? ' - ' + errorDescription : ''}`);
      }

      if (!accessToken || !state) {
        throw new Error('Missing access token or state parameter');
      }

      // Retrieve and validate OAuth state
      const oauthState = await this.getOAuthState();
      if (!oauthState || oauthState.state !== state) {
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }

      // Get user ID for token storage
      const userResponse = await fetch(`${TWITCH_ENDPOINTS.API_BASE}${TWITCH_ENDPOINTS.USERS}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': TWITCH_CONFIG.CLIENT_ID,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const userData: TwitchUserInfoResponse = await userResponse.json();
      const userId = userData.data[0]?.id;

      if (!userId) {
        throw new Error('Unable to determine user ID');
      }

      // Build stored token
      const now = new Date();
      const storedToken: StoredAuthToken = {
        access_token: accessToken,
        token_type: tokenType || 'bearer',
        expires_in: expiresIn ? parseInt(expiresIn) : 3600,
        scope: scope ? scope.split(' ') : TWITCH_CONFIG.REQUIRED_SCOPES,
        obtainedAt: now,
        expiresAt: new Date(now.getTime() + (expiresIn ? parseInt(expiresIn) * 1000 : 3600000)),
        userId,
        // Implicit flow does not provide refresh tokens
      };

      // Store token securely
      await this.storeToken(storedToken);

      // Clean up OAuth state
      await this.clearOAuthState();

      this.log('Authentication successful');
      return true;
    } catch (error) {
      this.logError('Error handling auth callback', error);
      await this.clearOAuthState();
      return false;
    }
  }


  /**
   * Get valid access token
   * Note: Implicit flow does not support refresh tokens - user must re-authenticate when token expires
   */
  async getValidToken(): Promise<StoredAuthToken | null> {
    try {
      const token = await this.getStoredToken();

      if (!token) {
        return null;
      }

      if (this.isTokenValid(token)) {
        return token;
      }

      // Token is expired - implicit flow does not provide refresh tokens
      // User must re-authenticate
      await this.clearStoredToken();
      return null;
    } catch (error) {
      this.logError('Error getting valid token', error);
      return null;
    }
  }


  /**
   * Validate token expiration
   */
  private isTokenValid(token: StoredAuthToken): boolean {
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    // Add 5 minute buffer to account for network latency
    const buffer = 5 * 60 * 1000;
    return now.getTime() < (expiresAt.getTime() - buffer);
  }

  /**
   * Validate token with Twitch API
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        return false;
      }

      const response = await fetch(TWITCH_ENDPOINTS.VALIDATE, {
        headers: {
          'Authorization': `OAuth ${token.access_token}`,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (response.ok) {
        return true;
      }

      // Token is invalid, clear it
      await this.clearStoredToken();
      return false;
    } catch (error) {
      this.logError('Error validating token', error);
      return false;
    }
  }

  /**
   * Sign out user and clear all authentication data
   */
  async signOut(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      
      if (token) {
        // Revoke token with Twitch
        try {
          await fetch(TWITCH_ENDPOINTS.REVOKE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: TWITCH_CONFIG.CLIENT_ID,
              token: token.access_token,
            }),
          });
        } catch (error) {
          // Continue with local cleanup even if revocation fails
          this.logError('Error revoking token', error);
        }
      }

      // Clear local authentication data
      await this.clearStoredToken();
      await this.clearOAuthState();
      
      // Clear in-memory cache
      this.currentToken = null;
      this.currentUser = null;

      this.log('User signed out successfully');
    } catch (error) {
      this.logError('Error during sign out', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Store authentication token in IndexedDB
   */
  private async storeToken(token: StoredAuthToken): Promise<void> {
    const db = await getDB();
    await db.put(STORAGE_KEYS.AUTH_STORE, {
      key: 'token',
      value: token,
      updatedAt: new Date(),
    });
    this.currentToken = token;
  }

  /**
   * Get stored authentication token
   */
  private async getStoredToken(): Promise<StoredAuthToken | null> {
    if (this.currentToken) {
      return this.currentToken;
    }

    try {
      const db = await getDB();
      const result = await db.get(STORAGE_KEYS.AUTH_STORE, 'token');
      
      if (result?.value) {
        // Convert date strings back to Date objects
        const token = {
          ...result.value,
          obtainedAt: new Date(result.value.obtainedAt),
          expiresAt: new Date(result.value.expiresAt),
        };
        this.currentToken = token;
        return token;
      }
      
      return null;
    } catch (error) {
      this.logError('Error retrieving stored token', error);
      return null;
    }
  }

  /**
   * Clear stored authentication token
   */
  private async clearStoredToken(): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORAGE_KEYS.AUTH_STORE, 'token');
      this.currentToken = null;
      this.currentUser = null;
    } catch (error) {
      this.logError('Error clearing stored token', error);
    }
  }

  /**
   * Store OAuth state for CSRF protection
   */
  private async storeOAuthState(state: OAuthState): Promise<void> {
    const db = await getDB();
    await db.put(STORAGE_KEYS.AUTH_STORE, {
      key: 'oauth_state',
      value: state,
      updatedAt: new Date(),
    });
  }

  /**
   * Get stored OAuth state
   */
  private async getOAuthState(): Promise<OAuthState | null> {
    try {
      const db = await getDB();
      const result = await db.get(STORAGE_KEYS.AUTH_STORE, 'oauth_state');
      
      if (result?.value) {
        return {
          ...result.value,
          createdAt: new Date(result.value.createdAt),
        };
      }
      
      return null;
    } catch (error) {
      this.logError('Error retrieving OAuth state', error);
      return null;
    }
  }

  /**
   * Clear OAuth state
   */
  private async clearOAuthState(): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORAGE_KEYS.AUTH_STORE, 'oauth_state');
    } catch (error) {
      this.logError('Error clearing OAuth state', error);
    }
  }

  /**
   * Generate cryptographically secure random string
   */
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }


  /**
   * Log messages (respects debug settings)
   */
  private log(message: string, data?: any): void {
    if (FEATURE_FLAGS.DEBUG_LOGGING) {
      console.log(`[TwitchAuth] ${message}`, data || '');
    }
  }

  /**
   * Log errors
   */
  private logError(message: string, error: any): void {
    console.error(`[TwitchAuth] ${message}:`, error);
  }
}

/**
 * Convenience functions for auth operations
 */

/**
 * Get the TwitchAuth singleton instance
 */
export const getTwitchAuth = (): TwitchAuth => TwitchAuth.getInstance();

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): Promise<boolean> => getTwitchAuth().isAuthenticated();

/**
 * Start OAuth flow
 */
export const startAuthFlow = (): Promise<void> => getTwitchAuth().startAuthFlow();

/**
 * Handle auth callback
 */
export const handleAuthCallback = (url: string): Promise<boolean> => getTwitchAuth().handleAuthCallback(url);

/**
 * Get current user
 */
export const getCurrentUser = (): Promise<TwitchUserResponse | null> => getTwitchAuth().getCurrentUser();

/**
 * Get valid token
 */
export const getValidToken = (): Promise<StoredAuthToken | null> => getTwitchAuth().getValidToken();

/**
 * Sign out user
 */
export const signOut = (): Promise<void> => getTwitchAuth().signOut();

/**
 * Validate current token
 */
export const validateToken = (): Promise<boolean> => getTwitchAuth().validateToken();
