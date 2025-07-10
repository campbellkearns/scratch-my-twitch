import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateProfile from './pages/CreateProfile'
import EditProfile from './pages/EditProfile'
import AuthPage from './pages/AuthPage'
import './App.css'

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile/new" element={<CreateProfile />} />
        <Route path="profile/:id/edit" element={<EditProfile />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
    </Routes>
  )
}

export default App