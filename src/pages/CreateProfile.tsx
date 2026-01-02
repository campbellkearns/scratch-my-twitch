import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '@/hooks/useProfiles'
import { CategorySearchDropdown } from '@/components/CategorySearchDropdown'
import type { CreateProfileInput, StreamCategory } from '@/types/Profile'

export default function CreateProfile(): JSX.Element {
  const navigate = useNavigate()
  const { createProfile, isLoading } = useProfiles()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    tags: ''
  })

  const [selectedCategory, setSelectedCategory] = useState<StreamCategory | null>(null)
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Profile name is required'
    } else if (formData.name.length > 50) {
      errors.name = 'Profile name must be 50 characters or less'
    }
    
    // Category validation
    if (!selectedCategory || !selectedCategory.name.trim()) {
      errors.category = 'Category is required'
    }
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Stream title is required'
    } else if (formData.title.length > 140) {
      errors.title = 'Stream title must be 140 characters or less'
    }
    
    // Tags validation
    if (formData.tags) {
      const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      if (tagArray.length > 10) {
        errors.tags = 'Maximum 10 tags allowed'
      }
      
      const invalidTags = tagArray.filter(tag => tag.length > 25)
      if (invalidTags.length > 0) {
        errors.tags = 'Each tag must be 25 characters or less'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Convert form data to profile input
      const profileInput: CreateProfileInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: selectedCategory!,
        title: formData.title.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : []
      }
      
      const newProfile = await createProfile(profileInput)
      
      if (newProfile) {
        // Success! Navigate back to dashboard
        navigate('/', { 
          state: { 
            message: `Profile "${newProfile.name}" created successfully!` 
          }
        })
      } else {
        // Error is handled by the hook, but we can show a generic message
        setFormErrors({ 
          general: 'Failed to create profile. Please check your input and try again.' 
        })
      }
    } catch (error) {
      setFormErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const isFormDisabled = isLoading || isSubmitting

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-medium text-neutral-900 mb-3">
          Create New Profile
        </h1>
        <p className="text-lg text-neutral-600">
          Set up a new stream profile for quick updates
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General error message */}
          {formErrors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{formErrors.general}</p>
            </div>
          )}
          
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-6">
              Profile Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Profile Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`scandi-input w-full ${formErrors.name ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="e.g., Morning Pages"
                  disabled={isFormDisabled}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="scandi-input w-full resize-none"
                  placeholder="Brief description of this stream type"
                  disabled={isFormDisabled}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                  Twitch Category *
                </label>
                <CategorySearchDropdown
                  value={selectedCategory}
                  onChange={(category) => {
                    setSelectedCategory(category);
                    // Clear error when category is selected
                    if (category && formErrors.category) {
                      setFormErrors(prev => ({
                        ...prev,
                        category: ''
                      }));
                    }
                  }}
                  error={formErrors.category}
                  disabled={isFormDisabled}
                  required
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Stream Title Template *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`scandi-input w-full ${formErrors.title ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="e.g., Morning Pages - {DAY} Reflection"
                  disabled={isFormDisabled}
                  required
                />
                {formErrors.title && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.title}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  Use {`{DAY}`} for day of week, {`{YYYY-MM-DD}`} for date
                </p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`scandi-input w-full ${formErrors.tags ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="journal, morning, reflection (comma separated)"
                  disabled={isFormDisabled}
                />
                {formErrors.tags && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.tags}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  Separate tags with commas, max 10 tags
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-neutral-600 hover:text-neutral-900 transition-colors"
              disabled={isFormDisabled}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isFormDisabled}
              className="scandi-btn flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
