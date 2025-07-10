/**
 * Core Profile Domain Model
 * 
 * Represents a stream profile with all necessary information to update
 * a Twitch stream's category, title, and tags with a single click.
 */

/**
 * Twitch Category information cached for offline use
 */
export interface StreamCategory {
  /** Twitch's internal category/game ID */
  id: string;
  /** Human-readable category name (e.g., "Just Chatting", "Science & Technology") */
  name: string;
  /** Optional box art URL for UI display */
  boxArtUrl?: string;
}

/**
 * Tags array with compile-time length enforcement
 * Twitch allows maximum 10 tags per stream
 */
export type StreamTags = readonly [
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?
] & { length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 };

/**
 * Main Stream Profile entity
 * 
 * Contains all information needed to apply a complete stream configuration
 * via the Twitch API. Designed for offline-first operation.
 */
export interface StreamProfile {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-friendly profile name (e.g., "Morning Pages", "Coding Stream") */
  name: string;
  
  /** Optional description for user reference */
  description?: string;
  
  /** Stream category/game with cached offline data */
  category: StreamCategory;
  
  /** 
   * Stream title supporting dynamic templating
   * Supported placeholders:
   * - {YYYY-MM-DD}: Current date (e.g., "2025-07-09")
   * - {DAY}: Current day of week (e.g., "Wednesday")
   */
  title: string;
  
  /** Stream tags (maximum 10) */
  tags: string[];
  
  /** Profile creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
}

/**
 * Profile creation input (omits generated fields)
 */
export interface CreateProfileInput {
  name: string;
  description?: string;
  category: StreamCategory;
  title: string;
  tags: string[];
}

/**
 * Profile update input (partial with required ID)
 */
export interface UpdateProfileInput extends Partial<CreateProfileInput> {
  id: string;
}

/**
 * Profile validation result
 */
export interface ProfileValidationResult {
  isValid: boolean;
  errors: ProfileValidationError[];
}

/**
 * Profile validation error
 */
export interface ProfileValidationError {
  field: keyof StreamProfile;
  message: string;
  code: string;
}

/**
 * Validation error codes for consistent error handling
 */
export const PROFILE_VALIDATION_ERRORS = {
  NAME_REQUIRED: 'NAME_REQUIRED',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  TITLE_REQUIRED: 'TITLE_REQUIRED', 
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',
  CATEGORY_REQUIRED: 'CATEGORY_REQUIRED',
  TAGS_TOO_MANY: 'TAGS_TOO_MANY',
  TAG_TOO_LONG: 'TAG_TOO_LONG',
  TAG_INVALID_CHARS: 'TAG_INVALID_CHARS'
} as const;

/**
 * Dynamic title template processing result
 */
export interface ProcessedTitle {
  /** Original title with placeholders */
  template: string;
  /** Processed title with placeholders replaced */
  processed: string;
  /** Placeholders that were found and replaced */
  replacements: Record<string, string>;
}

/**
 * Template placeholders supported in titles
 */
export const TITLE_TEMPLATES = {
  DATE: '{YYYY-MM-DD}',
  DAY: '{DAY}'
} as const;

/**
 * Profile export/import format for backup/restore
 */
export interface ProfileExport {
  version: string;
  exportedAt: Date;
  profiles: StreamProfile[];
}
