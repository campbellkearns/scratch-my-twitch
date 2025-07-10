import './App.css'

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-5 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-medium text-neutral-900 mb-3">
            Scratch My Twitch
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your streaming profiles with ease
          </p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article className="scandi-card">
            <h2 className="text-2xl font-medium text-neutral-900 mb-3">
              Morning Pages
            </h2>
            <p className="text-base text-neutral-600 mb-5">
              Your daily journaling stream
            </p>
            <button className="scandi-btn w-full">
              Apply Profile
            </button>
          </article>
          
          <article className="scandi-card">
            <h2 className="text-2xl font-medium text-neutral-900 mb-3">
              Coding Session
            </h2>
            <p className="text-base text-neutral-600 mb-5">
              Building cool projects live
            </p>
            <button className="scandi-btn w-full">
              Apply Profile
            </button>
          </article>
        </main>
      </div>
    </div>
  )
}

export default App