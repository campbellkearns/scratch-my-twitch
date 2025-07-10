import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateProfile(): JSX.Element {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    title: '',
    tags: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Replace with actual profile creation
    setTimeout(() => {
      setIsLoading(false)
      navigate('/')
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-6">
              Profile Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="scandi-input w-full"
                  placeholder="e.g., Morning Pages"
                  required
                />
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
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                  Twitch Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="scandi-input w-full"
                  placeholder="e.g., Just Chatting"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  The exact category name from Twitch
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Stream Title Template
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="scandi-input w-full"
                  placeholder="e.g., Morning Pages - {DAY} Reflection"
                  required
                />
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
                  className="scandi-input w-full"
                  placeholder="journal, morning, reflection (comma separated)"
                />
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
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="scandi-btn flex items-center space-x-2"
            >
              {isLoading ? (
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