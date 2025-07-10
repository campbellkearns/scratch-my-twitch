import { Link } from 'react-router-dom'
import { useProfiles } from '@/hooks/useProfiles'
import { processTitle } from '@/types/ProfileUtils'

export default function Dashboard(): JSX.Element {
  const { 
    profiles, 
    isLoading, 
    error, 
    deleteProfile, 
    applyProfile,
    clearError,
    isEmpty,
    profileCount 
  } = useProfiles()

  const handleDeleteProfile = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await deleteProfile(id)
      if (!success) {
        // Error handling is managed by the hook
        console.error('Failed to delete profile')
      }
    }
  }

  const handleApplyProfile = async (profile: any) => {
    const success = await applyProfile(profile)
    if (success) {
      // For now, just show a success message
      const processedTitle = processTitle(profile.title)
      alert(`Applied profile "${profile.name}"!\nTitle: ${processedTitle.processed}`)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-lg text-neutral-600">Loading your profiles...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-medium text-neutral-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-neutral-600 mb-6">
          {error}
        </p>
        <button 
          onClick={clearError}
          className="scandi-btn"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-medium text-neutral-900 mb-3">
            Stream Profiles
          </h1>
          <p className="text-lg text-neutral-600">
            {profileCount === 0 
              ? 'No profiles yet - create your first one to get started'
              : `${profileCount} profile${profileCount === 1 ? '' : 's'} ready to use`
            }
          </p>
        </div>
        
        <Link 
          to="/profile/new"
          className="scandi-btn flex items-center space-x-2"
        >
          <span>➕</span>
          <span>New Profile</span>
        </Link>
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-medium text-neutral-900 mb-2">
            No profiles yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Create your first stream profile to get started
          </p>
          <Link to="/profile/new" className="scandi-btn">
            Create Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const processedTitle = processTitle(profile.title)
            
            return (
              <article key={profile.id} className="scandi-card group">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-medium text-neutral-900">
                    {profile.name}
                  </h2>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/profile/${profile.id}/edit`}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      title="Edit profile"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                      title="Delete profile"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {profile.description && (
                  <p className="text-neutral-600 mb-4">
                    {profile.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-6 text-sm">
                  <div>
                    <span className="text-neutral-500">Category:</span>{' '}
                    <span className="text-neutral-700">{profile.category.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Title:</span>{' '}
                    <span className="text-neutral-700" title={`Original: ${profile.title}`}>
                      {processedTitle.processed}
                    </span>
                  </div>
                  {profile.tags.length > 0 && (
                    <div>
                      <span className="text-neutral-500">Tags:</span>{' '}
                      <span className="text-neutral-700">{profile.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => handleApplyProfile(profile)}
                    className="scandi-btn w-full"
                  >
                    Apply Profile
                  </button>
                  
                  <div className="text-xs text-neutral-400 text-center">
                    Updated {profile.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
