import type { Profile, CreateProfileDto, UpdateProfileDto } from '@/types/Profile'
import type { ApiResponse } from '@/types'
import { getDB } from '@/lib/db/indexedDB'
import { generateId } from '@/lib/utils'

/**
 * Profile Repository - handles all profile data operations
 * Implements the repository pattern for clean separation of concerns
 */
export class ProfileRepository {
  private readonly storeName = 'profiles'

  /**
   * Get all profiles, sorted by creation date (newest first)
   */
  async getAll(): Promise<ApiResponse<Profile[]>> {
    try {
      const db = await getDB()
      const profiles = await db.getAll<Profile>(this.storeName)
      
      // Sort by creation date, newest first
      const sortedProfiles = profiles.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return {
        success: true,
        data: sortedProfiles
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch profiles',
          details: error
        }
      }
    }
  }

  /**
   * Get a profile by ID
   */
  async getById(id: string): Promise<ApiResponse<Profile>> {
    try {
      const db = await getDB()
      const profile = await db.get<Profile>(this.storeName, id)

      if (!profile) {
        return {
          success: false,
          error: {
            message: 'Profile not found',
            code: 'NOT_FOUND'
          }
        }
      }

      return {
        success: true,
        data: profile
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch profile',
          details: error
        }
      }
    }
  }

  /**
   * Create a new profile
   */
  async create(profileData: CreateProfileDto): Promise<ApiResponse<Profile>> {
    try {
      // Validate required fields
      const validation = this.validateProfileData(profileData)
      if (!validation.success) {
        return validation
      }

      const now = new Date()
      const profile: Profile = {
        id: generateId(),
        ...profileData,
        createdAt: now,
        updatedAt: now
      }

      const db = await getDB()
      await db.add(this.storeName, profile)

      return {
        success: true,
        data: profile
      }
    } catch (error) {
      // Handle unique constraint violations or other DB errors
      if (error instanceof Error && error.name === 'ConstraintError') {
        return {
          success: false,
          error: {
            message: 'A profile with this name already exists',
            code: 'DUPLICATE_NAME'
          }
        }
      }

      return {
        success: false,
        error: {
          message: 'Failed to create profile',
          details: error
        }
      }
    }
  }

  /**
   * Update an existing profile
   */
  async update(id: string, updates: UpdateProfileDto): Promise<ApiResponse<Profile>> {
    try {
      // First, get the existing profile
      const existingResult = await this.getById(id)
      if (!existingResult.success || !existingResult.data) {
        return existingResult
      }

      // Validate updates
      const validation = this.validateProfileData(updates, true)
      if (!validation.success) {
        return validation
      }

      const updatedProfile: Profile = {
        ...existingResult.data,
        ...updates,
        updatedAt: new Date()
      }

      const db = await getDB()
      await db.put(this.storeName, updatedProfile)

      return {
        success: true,
        data: updatedProfile
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to update profile',
          details: error
        }
      }
    }
  }

  /**
   * Delete a profile
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if profile exists first
      const existingResult = await this.getById(id)
      if (!existingResult.success) {
        return {
          success: false,
          error: {
            message: 'Profile not found',
            code: 'NOT_FOUND'
          }
        }
      }

      const db = await getDB()
      await db.delete(this.storeName, id)

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to delete profile',
          details: error
        }
      }
    }
  }

  /**
   * Search profiles by name
   */
  async searchByName(query: string): Promise<ApiResponse<Profile[]>> {
    try {
      const allProfilesResult = await this.getAll()
      if (!allProfilesResult.success || !allProfilesResult.data) {
        return allProfilesResult
      }

      const filteredProfiles = allProfilesResult.data.filter(profile =>
        profile.name.toLowerCase().includes(query.toLowerCase())
      )

      return {
        success: true,
        data: filteredProfiles
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to search profiles',
          details: error
        }
      }
    }
  }

  /**
   * Validate profile data
   */
  private validateProfileData(
    data: CreateProfileDto | UpdateProfileDto, 
    isUpdate = false
  ): ApiResponse<void> {
    const errors: string[] = []

    // Name validation
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Profile name is required')
      } else if (data.name.trim().length > 50) {
        errors.push('Profile name must be 50 characters or less')
      }
    }

    // Category validation
    if (!isUpdate || data.category !== undefined) {
      if (!data.category || !data.category.id || !data.category.name) {
        errors.push('Stream category is required')
      }
    }

    // Title validation
    if (!isUpdate || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push('Stream title is required')
      } else if (data.title.trim().length > 140) {
        errors.push('Stream title must be 140 characters or less')
      }
    }

    // Tags validation
    if (!isUpdate || data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push('Tags must be an array')
      } else if (data.tags.length > 10) {
        errors.push('Maximum 10 tags allowed')
      } else {
        const invalidTags = data.tags.filter(tag => 
          typeof tag !== 'string' || tag.trim().length === 0 || tag.length > 25
        )
        if (invalidTags.length > 0) {
          errors.push('Each tag must be a non-empty string of 25 characters or less')
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors.join(', '),
          code: 'VALIDATION_ERROR'
        }
      }
    }

    return { success: true }
  }

  /**
   * Get profile count
   */
  async getCount(): Promise<ApiResponse<number>> {
    try {
      const allProfilesResult = await this.getAll()
      if (!allProfilesResult.success || !allProfilesResult.data) {
        return {
          success: false,
          error: allProfilesResult.error || { message: 'Failed to get profile count' }
        }
      }

      return {
        success: true,
        data: allProfilesResult.data.length
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to get profile count',
          details: error
        }
      }
    }
  }
}

// Singleton instance
let repositoryInstance: ProfileRepository | null = null

/**
 * Get the profile repository instance
 */
export const getProfileRepository = (): ProfileRepository => {
  if (!repositoryInstance) {
    repositoryInstance = new ProfileRepository()
  }
  return repositoryInstance
}
