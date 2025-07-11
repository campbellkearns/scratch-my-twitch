/**
 * Auth Callback Component
 * 
 * Handles the OAuth callback from Twitch and processes the authorization code
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for error parameter
        const errorParam = urlParams.get('error');
        if (errorParam) {
          setCallbackError(`Authentication failed: ${errorParam}`);
          setIsProcessing(false);
          return;
        }

        // Check for authorization code
        const code = urlParams.get('code');
        if (!code) {
          setCallbackError('No authorization code received');
          setIsProcessing(false);
          return;
        }

        // The useAuth hook will automatically process the callback
        // Just wait for the authentication state to update
        
        // Wait a moment for auth processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing callback:', err);
        setCallbackError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, []);

  // Redirect to dashboard if authentication successful
  useEffect(() => {
    if (!isProcessing && isAuthenticated) {
      // Clear URL parameters and redirect
      window.history.replaceState({}, document.title, '/');
      navigate('/', { replace: true });
    }
  }, [isProcessing, isAuthenticated, navigate]);

  // Show error state
  if (callbackError || (!isProcessing && error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md w-full mx-4">
          <div className="scandi-card text-center">
            <div className="text-6xl mb-6">❌</div>
            
            <h1 className="text-2xl font-medium text-neutral-900 mb-4">
              Authentication Failed
            </h1>
            
            <p className="text-neutral-600 mb-8">
              {callbackError || error}
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/auth', { replace: true })}
                className="scandi-btn w-full"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => navigate('/', { replace: true })}
                className="scandi-btn bg-neutral-100 text-neutral-900 hover:bg-neutral-200 w-full"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full mx-4">
        <div className="scandi-card text-center">
          <div className="text-6xl mb-6">🔄</div>
          
          <h1 className="text-2xl font-medium text-neutral-900 mb-4">
            Completing Authentication
          </h1>
          
          <p className="text-neutral-600 mb-8">
            Please wait while we complete your Twitch connection...
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-neutral-600">Processing...</span>
          </div>
          
          <p className="text-xs text-neutral-500 mt-6">
            This should only take a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}
