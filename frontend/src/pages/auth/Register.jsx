import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import './auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { register, login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
     await register({
      username: username.trim(),
      email: email.trim(),
      password,
      email_verification: false,
     })

     navigate('/login', {
      replace: true,
      state: {
        message: 'Account created successfully. Please sign in.',
      },
     })
    } catch (err) {
      setError(err.message || 'Registration failed')
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

            <h1>Create your account</h1>
            <p className="sub">Start turning your first PDF into a study guide.</p>

            <div className="social-row">
              <button type="button" className="social-btn" disabled>
                <FcGoogle size={16} /> Google
              </button>
              <button type="button" className="social-btn" disabled>
                <FaApple size={16} /> Apple
              </button>
            </div>
            <div className="divider">OR CONTINUE WITH EMAIL</div>

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
                  placeholder="abdellatif"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <label className="checkbox-row" style={{ marginBottom: 22 }}>
                <input type="checkbox" required /> I agree to the Terms and Privacy Policy
              </label>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Account'} {!submitting && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="foot-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>

        <div className="auth-illu-col register">
          <div className="blob blob1" />
          <div className="blob blob2" />
          <div className="illu-glass">
            <h2>Build your own library</h2>
            <p>
              Every subject gets its own shelf. Every PDF becomes a book you can chat with and get
              quizzed on.
            </p>
            <ul className="illu-list">
              <li>
                <CheckCircle2 /> Unlimited PDF uploads
              </li>
              <li>
                <CheckCircle2 /> AI chat grounded in your document
              </li>
              <li>
                <CheckCircle2 /> Auto-generated quizzes
              </li>
              <li>
                <CheckCircle2 /> Progress tracking across subjects
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
