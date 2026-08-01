import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { BookOpen, Bell, Settings } from 'lucide-react'

export default function Nav() {
  const navigate = useNavigate()

  return (
    <div className="topnav-inner">
      <Link to="/chat" className="brand">
        <span className="brand-mark">
          <BookOpen size={17} />
        </span>
        Folio
      </Link>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Home
        </NavLink>
        <NavLink
          to="/documents"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Library
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Chats
        </NavLink>
        <NavLink to="/quiz" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Quizzes
        </NavLink>
      </nav>

      <div className="nav-right">
        <button type="button" className="btn-icon" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="btn-icon"
          aria-label="Settings"
          onClick={() => navigate('/settings')}
        >
          <Settings size={18} />
        </button>
        <Link to="/profile" className="avatar">
          A
        </Link>
      </div>
    </div>
  )
}
