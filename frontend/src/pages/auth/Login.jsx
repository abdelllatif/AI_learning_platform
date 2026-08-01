import React, { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, ArrowRight, FileText, CheckCircle2 } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import './auth.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/chat'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-form-col">
          <div className="auth-box">
            <Link to="/" className="auth-brand">
              <span className="brand-mark">
                <BookOpen size={17} />
              </span>
              Folio
            </Link>

            <h1>Welcome back</h1>
            <p className="sub">Log in to pick up right where you left off.</p>

            <div className="social-row">
              <button type="button" className="social-btn" disabled>
                <FcGoogle size={16} /> Google
              </button>
              <button type="button" className="social-btn" disabled>
                <FaApple size={16} /> Apple
              </button>
            </div>
            <div className="divider">OR CONTINUE WITH USERNAME</div>

            <form onSubmit={handleSubmit}>
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="row-between">
                <label className="checkbox-row">
                  <input type="checkbox" /> Remember me
                </label>
                <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>Forgot password?</span>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log In'} {!submitting && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="foot-link">
              Don't have an account? <Link to="/register">Sign up free</Link>
            </p>
          </div>
        </div>

        <div className="auth-illu-col">
          <div className="blob blob1" />
          <div className="blob blob2" />
          <div className="float-doc fd1">
            <FileText size={15} /> Algorithms.pdf
          </div>
          <div className="float-doc fd2">
            <CheckCircle2 size={15} /> Quiz complete — 92%
          </div>
          <div className="illu-glass">
            <h2>Learn faster with AI</h2>
            <p>
              Every document you upload becomes a book in your personal library — with its own chat
              and quizzes.
            </p>
            <div className="illu-stat-row">
              <div className="illu-stat">
                <b>12k+</b>
                <span>Documents read</span>
              </div>
              <div className="illu-stat">
                <b>48k+</b>
                <span>Quizzes taken</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
