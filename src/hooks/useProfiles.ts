import { useState, useEffect, useCallback } from 'react'
import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types/Profile'
import type { LoadingState } from '@/types'
import { getProfileRepository } from '@/repositories/ProfileRepository'

/**
 * Custom hook for managing profiles
 * Provides CRUD operations with loading states and error handling
 */
export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const profileRepository = getProfileRepository()

  /**
   * Load all profiles from the repository
   */
  const loadProfiles = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const result = await profileRepository.getAll()
      
      if (result.success && result.data) {
        setProfiles(result.data)
        setLoadingState({ isLoading: false, error: null })
      } else {
        setLoadingState({
          isLoading: false,
          error: result.error?.message || 'Failed to load profiles'
        })
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }, [profileRepository])

  /**
   * Create a new profile
   */
  const createProfile = useCallback(async (profileData: CreateProfileDto): Promise<Profile | null> => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const result = await profileRepository.create(profileData)
      
      if (result.success && result.data) {
        // Add the new profile to the current list
        setProfiles(prev => [result.data!, ...prev])
        setLoadingState({ isLoading: false, error: null })
        return result.data
      } else {
        setLoadingState({
          isLoading: false,
          error: result.error?.message || 'Failed to create profile'
        })
        return null
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      return null
    }
  }, [profileRepository])

  /**
   * Update an existing profile
   */
  const updateProfile = useCallback(async (id: string, updates: UpdateProfileDto): Promise<Profile | null> => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const result = await profileRepository.update(id, updates)
      
      if (result.success && result.data) {
        // Update the profile in the current list
        setProfiles(prev => 
          prev.map(profile => 
            profile.id === id ? result.data! : profile
          )
        )
        setLoadingState({ isLoading: false, error: null })
        return result.data
      } else {
        setLoadingState({
          isLoading: false,
          error: result.error?.message || 'Failed to update profile'
        })
        return null
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      return null
    }
  }, [profileRepository])

  /**
   * Delete a profile
   */
  const deleteProfile = useCallback(async (id: string): Promise<boolean> => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const result = await profileRepository.delete(id)
      
      if (result.success) {
        // Remove the profile from the current list
        setProfiles(prev => prev.filter(profile => profile.id !== id))
        setLoadingState({ isLoading: false, error: null })
        return true
      } else {
        setLoadingState({
          isLoading: false,
          error: result.error?.message || 'Failed to delete profile'
        })
        return false
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      return false
    }
  }, [profileRepository])

  /**
   * Get a specific profile by ID
   */
  const getProfile = useCallback(async (id: string): Promise<Profile | null> => {
    try {
      const result = await profileRepository.getById(id)
      return result.success && result.data ? result.data : null
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }, [profileRepository])

  /**
   * Search profiles by name
   */
  const searchProfiles = useCallback(async (query: string): Promise<Profile[]> => {
    try {
      const result = await profileRepository.searchByName(query)
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error('Failed to search profiles:', error)
      return []
    }
  }, [profileRepository])

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setLoadingState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * Refresh profiles (reload from database)
   */
  const refreshProfiles = useCallback(() => {
    loadProfiles()
  }, [loadProfiles])

  // Load profiles on hook initialization
  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  return {
    // Data
    profiles,
    
    // Loading state
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    
    // Operations
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    searchProfiles,
    refreshProfiles,
    
    // Utils
    clearError,
    
    // Computed values
    profileCount: profiles.length,
    hasProfiles: profiles.length > 0
  }
}

/**
 * Hook for managing a single profile (useful for edit forms)
 */
export const useProfile = (id: string | null) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const profileRepository = getProfileRepository()

  const loadProfile = useCallback(async () => {
    if (!id) {
      setProfile(null)
      setLoadingState({ isLoading: false, error: null })
      return
    }

    setLoadingState({ isLoading: true, error: null })
    
    try {
      const result = await profileRepository.getById(id)
      
      if (result.success && result.data) {
        setProfile(result.data)
        setLoadingState({ isLoading: false, error: null })
      } else {
        setProfile(null)
        setLoadingState({
          isLoading: false,
          error: result.error?.message || 'Profile not found'
        })
      }
    } catch (error) {
      setProfile(null)
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }, [id, profileRepository])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    reload: loadProfile
  }
}
