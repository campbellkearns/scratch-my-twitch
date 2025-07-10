import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateProfile from './pages/CreateProfile';
import EditProfile from './pages/EditProfile';
import AuthPage from './pages/AuthPage';
import { initializeRepositories } from './repositories';
import './App.css';

// Import test functions in development
if (import.meta.env.DEV) {
  import('./lib/test/repositoryTests');
}

function App(): JSX.Element {
  useEffect(() => {
    // Initialize repositories on app start
    initializeRepositories().then((status) => {
      console.log('🚀 Repository initialization:', status);
      if (!status.allReady) {
        console.warn('⚠️ Some repositories failed to initialize');
      }
    }).catch((error) => {
      console.error('💥 Repository initialization failed:', error);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile/new" element={<CreateProfile />} />
        <Route path="profile/:id/edit" element={<EditProfile />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
    </Routes>
  );
}

export default App