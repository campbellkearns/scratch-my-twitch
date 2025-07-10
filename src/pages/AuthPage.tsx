export default function AuthPage(): JSX.Element {
  const handleConnect = () => {
    // TODO: Implement Twitch OAuth flow
    console.log('Starting Twitch OAuth flow...')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-medium text-neutral-900 mb-3">
          Connect to Twitch
        </h1>
        <p className="text-lg text-neutral-600">
          Connect your Twitch account to update stream information
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="scandi-card text-center">
          <div className="text-6xl mb-6">🔗</div>
          
          <h2 className="text-2xl font-medium text-neutral-900 mb-4">
            Ready to Connect?
          </h2>
          
          <p className="text-neutral-600 mb-8">
            To apply profiles to your streams, we need permission to update your channel information. 
            This is secure and you can revoke access anytime in your Twitch settings.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <span className="text-green-500">✓</span>
              <span>Update stream category and title</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <span className="text-green-500">✓</span>
              <span>Manage stream tags</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <span className="text-green-500">✓</span>
              <span>No access to personal data</span>
            </div>
          </div>
          
          <button 
            onClick={handleConnect}
            className="scandi-btn text-lg px-8 py-4 flex items-center space-x-3 mx-auto"
          >
            <span>🎮</span>
            <span>Connect Twitch Account</span>
          </button>
          
          <p className="text-xs text-neutral-500 mt-6">
            By connecting, you agree to let this app manage your channel information
          </p>
        </div>
      </div>
    </div>
  )
}