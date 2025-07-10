import { Link } from 'react-router-dom'

export default function Dashboard(): JSX.Element {
  // TODO: Replace with real data from useProfiles hook
  const mockProfiles = [
    {
      id: '1',
      name: 'Morning Pages',
      description: 'Your daily journaling stream',
      category: 'Just Chatting',
      title: 'Morning Pages - {DAY} Reflection',
      tags: ['journal', 'morning', 'reflection']
    },
    {
      id: '2', 
      name: 'Coding Session',
      description: 'Building cool projects live',
      category: 'Software and Game Development',
      title: 'Live Coding: {YYYY-MM-DD}',
      tags: ['coding', 'react', 'typescript']
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-medium text-neutral-900 mb-3">
            Stream Profiles
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your streaming profiles with ease
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

      {mockProfiles.length === 0 ? (
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
          {mockProfiles.map((profile) => (
            <article key={profile.id} className="scandi-card group">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-medium text-neutral-900">
                  {profile.name}
                </h2>
                <Link
                  to={`/profile/${profile.id}/edit`}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✏️
                </Link>
              </div>
              
              <p className="text-neutral-600 mb-4">
                {profile.description}
              </p>
              
              <div className="space-y-2 mb-6 text-sm">
                <div>
                  <span className="text-neutral-500">Category:</span>{' '}
                  <span className="text-neutral-700">{profile.category}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Title:</span>{' '}
                  <span className="text-neutral-700">{profile.title}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Tags:</span>{' '}
                  <span className="text-neutral-700">{profile.tags.join(', ')}</span>
                </div>
              </div>
              
              <button className="scandi-btn w-full">
                Apply Profile
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}