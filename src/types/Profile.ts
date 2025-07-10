/**
 * Core Profile type for Scratch My Twitch
 * Represents a saved stream configuration that can be applied to Twitch
 */
export interface Profile {
  id: string;
  name: string;
  category: StreamCategory;
  title: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stream category information from Twitch API
 */
export interface StreamCategory {
  id: string;
  name: string;
  boxArtUrl?: string;
}

/**
 * Profile creation payload (before ID and timestamps are added)
 */
export interface CreateProfileDto {
  name: string;
  category: StreamCategory;
  title: string;
  tags: string[];
}

/**
 * Profile update payload (partial updates allowed)
 */
export interface UpdateProfileDto {
  name?: string;
  category?: StreamCategory;
  title?: string;
  tags?: string[];
}

/**
 * Profile with processed dynamic title (ready to apply to Twitch)
 */
export interface ProcessedProfile extends Omit<Profile, 'title'> {
  title: string; // Dynamic placeholders resolved
  originalTitle: string; // Template with placeholders
}
