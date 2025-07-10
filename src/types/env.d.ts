/**
 * Environment Variables Type Definitions
 * 
 * TypeScript definitions for Vite environment variables
 */

interface ImportMetaEnv {
  /** Twitch application client ID */
  readonly VITE_TWITCH_CLIENT_ID: string;
  /** API base URL override */
  readonly VITE_API_BASE_URL?: string;
  /** Enable debug mode */
  readonly VITE_DEBUG?: string;
  /** Environment name */
  readonly MODE: string;
  /** Development mode flag */
  readonly DEV: boolean;
  /** Production mode flag */
  readonly PROD: boolean;
  /** SSR mode flag */
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
