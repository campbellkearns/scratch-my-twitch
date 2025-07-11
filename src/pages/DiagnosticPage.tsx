/**
 * Diagnostic component to test if the app is working
 */

import { useState, useEffect } from 'react';

interface EnvInfo {
  mode: string;
  clientIdSet: boolean;
  baseUrl: string;
}

export default function DiagnosticPage(): JSX.Element {
  const [envInfo, setEnvInfo] = useState<EnvInfo | null>(null);

  useEffect(() => {
    // Safely access environment variables
    try {
      setEnvInfo({
        mode: import.meta.env.MODE || 'unknown',
        clientIdSet: !!import.meta.env.VITE_TWITCH_CLIENT_ID,
        baseUrl: import.meta.env.BASE_URL || '/'
      });
    } catch (error) {
      console.error('Error accessing environment:', error);
      setEnvInfo({
        mode: 'error',
        clientIdSet: false,
        baseUrl: '/'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">
          🔧 Application Diagnostic
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              ✅ React Rendering
            </h2>
            <p className="text-neutral-600">
              If you can see this page, React is working properly.
            </p>
          </div>
          
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              🎨 Tailwind CSS
            </h2>
            <p className="text-neutral-600">
              Scandinavian design system styles are loading correctly.
            </p>
          </div>
          
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              🔧 Environment
            </h2>
            <div className="text-sm space-y-2">
              {envInfo ? (
                <>
                  <p><strong>Mode:</strong> {envInfo.mode}</p>
                  <p><strong>Client ID:</strong> {envInfo.clientIdSet ? '✅ Set' : '❌ Not Set'}</p>
                  <p><strong>Base URL:</strong> {envInfo.baseUrl}</p>
                </>
              ) : (
                <p>Loading environment info...</p>
              )}
            </div>
          </div>
          
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              🌍 Browser
            </h2>
            <div className="text-sm space-y-2">
              <p><strong>Origin:</strong> {window.location.origin}</p>
              <p><strong>Path:</strong> {window.location.pathname}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="scandi-card">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              🧪 Quick Tests
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  console.log('Button click test successful');
                  alert('Button click works!');
                }}
                className="scandi-btn mr-4"
              >
                Test Button Click
              </button>
              
              <button 
                onClick={() => {
                  try {
                    const redirectUri = `${window.location.origin}/auth/callback`;
                    console.log('Redirect URI would be:', redirectUri);
                    alert(`Redirect URI: ${redirectUri}`);
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error: ' + error);
                  }
                }}
                className="scandi-btn bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              >
                Test Auth Config
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="flex gap-4 justify-center">
            <a href="/" className="scandi-btn">Go to Dashboard</a>
            <a href="/auth" className="scandi-btn bg-primary text-white">Go to Auth Page</a>
          </div>
        </div>
      </div>
    </div>
  );
}
