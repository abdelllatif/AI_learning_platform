import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Pencil,
  Library,
  MessageSquareText,
  ListChecks,
  Target,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { documentsApi, chatApi, quizApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './profile.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ docs: 0, chats: 0, quizzes: 0, avg: null })

  useEffect(() => {
    document.title = 'Profile — Folio'
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [docs, chats, hist] = await Promise.all([
          documentsApi.list(),
          chatApi.list(),
          quizApi.history(),
        ])
        if (cancelled) return
        const docCount = docs?.count ?? (docs?.results || docs || []).length
        const chatCount = chats?.count ?? (chats?.results || chats || []).length
        const attempts = Array.isArray(hist) ? hist : hist?.results || []
        const attemptCount = hist?.count ?? attempts.length
        const avg =
          attempts.length > 0
            ? Math.round(attempts.reduce((s, a) => s + Number(a.score || 0), 0) / attempts.length)
            : null
        setStats({ docs: docCount, chats: chatCount, quizzes: attemptCount, avg })
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initial = (user?.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="profile-shell">
      <div className="card profile-head">
        <div className="avatar-lg">{initial}</div>
        <div className="profile-head-body">
          <h1>{user?.username || 'User'}</h1>
          <span>{user?.email || '—'}</span>
        </div>
        <div className="profile-head-actions">
          <Link to="/settings" className="btn btn-ghost btn-sm">
            <Pencil size={14} /> Edit Profile
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-tile">
          <Library size={22} />
          <b>{stats.docs}</b>
          <span>Documents</span>
        </div>
        <div className="card stat-tile">
          <MessageSquareText size={22} />
          <b>{stats.chats}</b>
          <span>Chats</span>
        </div>
        <div className="card stat-tile">
          <ListChecks size={22} />
          <b>{stats.quizzes}</b>
          <span>Quizzes</span>
        </div>
        <div className="card stat-tile">
          <Target size={22} />
          <b>{stats.avg != null ? `${stats.avg}%` : '—'}</b>
          <span>Avg. score</span>
        </div>
      </div>

      <Link to="/settings" className="profile-all-settings">
        All settings <ChevronRight size={14} />
      </Link>
    </div>
  )
}
