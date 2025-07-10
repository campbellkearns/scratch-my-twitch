/**
 * Hooks Index
 * 
 * Central export point for all custom React hooks.
 * Provides clean imports for components.
 */

// Profile Management Hooks
export { 
  useProfiles, 
  useProfile, 
  useProfileValidation, 
  useProfileStats,
  useRepositoryHealth
} from './useProfiles';

// Category Management Hooks
export { 
  useCategories, 
  useCategorySearch, 
  useCategoryValidation 
} from './useCategories';

// Convenience object for all hooks
export const hooks = {
  // Profile hooks
  useProfiles,
  useProfile,
  useProfileValidation,
  useProfileStats,
  useRepositoryHealth,
  
  // Category hooks
  useCategories,
  useCategorySearch,
  useCategoryValidation
} as const;

/**
 * Hook types for external consumption
 */
export type ProfilesHookResult = ReturnType<typeof useProfiles>;
export type ProfileHookResult = ReturnType<typeof useProfile>;
export type CategoriesHookResult = ReturnType<typeof useCategories>;
export type CategorySearchHookResult = ReturnType<typeof useCategorySearch>;
