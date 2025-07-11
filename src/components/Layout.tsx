import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthState } from '@/hooks/useAuth'
import { getTwitchAuth } from '@/lib/auth/twitchAuth'

export default function Layout(): JSX.Element {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, isLoading } = useAuthState()
  
  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path
  }

  const handleSignOut = async () => {
    try {
      await getTwitchAuth().signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { path: '/', label: 'Profiles', icon: '📋' },
    { path: '/profile/new', label: 'New Profile', icon: '➕' },
    ...(isAuthenticated ? [] : [{ path: '/auth', label: 'Connect Twitch', icon: '🔗' }]),
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-5 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 text-2xl font-medium text-neutral-900 hover:text-primary transition-colors"
            >
              <span className="text-primary">🎮</span>
              <span>Scratch My Twitch</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActiveRoute(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              
              {/* Authentication Status */}
              {!isLoading && (
                <div className="flex items-center space-x-3 pl-4 border-l border-neutral-200">
                  {isAuthenticated && user ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={user.profile_image_url} 
                          alt={user.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-right">
                          <p className="text-sm font-medium text-neutral-900">{user.display_name}</p>
                          <p className="text-xs text-neutral-500">Connected</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="text-sm text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded hover:bg-neutral-100 transition-colors"
                        title="Sign out"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to="/auth"
                      className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <span>🔗</span>
                      <span>Connect Twitch</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActiveRoute(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Mobile Authentication Status */}
                {!isLoading && (
                  <div className="pt-4 mt-4 border-t border-neutral-200">
                    {isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-4 py-2">
                          <img 
                            src={user.profile_image_url} 
                            alt={user.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{user.display_name}</p>
                            <p className="text-xs text-neutral-500">@{user.login} • Connected</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link 
                        to="/auth"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <span>🔗</span>
                        <span>Connect Twitch</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-5 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  )
}