import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/dashboard/Dashboard'
import Documents from './pages/documents/Documents'
import Document from './pages/documents/Document'
import Upload from './pages/upload/Upload'
import Chat from './pages/chat/Chat'
import Quiz from './pages/quiz/Quiz'
import QuizResult from './pages/quiz/QuizResult'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Landing from './pages/landing/Landing'

function Guard({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  const location = useLocation()

  const noLayoutRoutes = ['/', '/login', '/register']
  const hideLayout = noLayoutRoutes.includes(location.pathname)
  const fullBleedRoutes = ['/chat', '/quiz']
  const isFullBleed = fullBleedRoutes.some(
    path => location.pathname === path || location.pathname.startsWith(`${path}/`)
  )

  const routes = (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="/documents" element={<Guard><Documents /></Guard>} />
      <Route path="/document/:id" element={<Guard><Document /></Guard>} />
      <Route path="/upload" element={<Guard><Upload /></Guard>} />
      <Route path="/chat" element={<Guard><Chat /></Guard>} />
      <Route path="/chat/:id" element={<Guard><Chat /></Guard>} />
      <Route path="/quiz" element={<Guard><Quiz /></Guard>} />
      <Route path="/quiz/result" element={<Guard><QuizResult /></Guard>} />
      <Route path="/quiz/:id" element={<Guard><Quiz /></Guard>} />
      <Route path="/settings" element={<Guard><Settings /></Guard>} />
      <Route path="/profile" element={<Guard><Profile /></Guard>} />
    </Routes>
  )

  if (hideLayout) {
    return routes
  }

  return (
    <div className={isFullBleed ? 'app-layout-bleed' : undefined}>
      <header className="topnav" style={isFullBleed ? { flexShrink: 0 } : undefined}>
        <Nav />
      </header>
      {isFullBleed ? routes : <main className="app-main">{routes}</main>}
    </div>
  )
}
