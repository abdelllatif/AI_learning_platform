import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Bell, Lock, TriangleAlert, Sun, Moon, Laptop } from 'lucide-react'
import { authApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './settings.css'

const THEMES = [
  { id: 'light', label: 'Light', Icon: Sun, previewClass: 'light' },
  { id: 'dark', label: 'Dark', Icon: Moon, previewClass: 'dark' },
  { id: 'system', label: 'System', Icon: Laptop, previewClass: 'system' },
]

export default function Settings() {
  const { user, refreshProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')
  const [dailyReminder, setDailyReminder] = useState(true)
  const [quizResults, setQuizResults] = useState(true)
  const [productUpdates, setProductUpdates] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    document.title = 'Settings — Folio'
  }, [])

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
    }
  }, [user])

  const saveProfile = async e => {
    e.preventDefault()
    setProfileMsg('')
    setProfileErr('')
    setSavingProfile(true)
    try {
      await authApi.updateProfile({ username: username.trim(), email: email.trim() })
      await refreshProfile()
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileErr(err.message || 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async e => {
    e.preventDefault()
    setPwMsg('')
    setPwErr('')
    setSavingPw(true)
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setPwMsg('Password updated.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwErr(err.message || 'Password update failed')
    } finally {
      setSavingPw(false)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Account deletion is not available on the API yet. Log out instead?'
      )
    ) {
      return
    }
    await logout()
    navigate('/login')
  }

  return (
    <>
      <h1 className="settings-title">Settings</h1>
      <div className="settings-shell">
        <nav className="settings-nav">
          <a href="#profile" className="active">
            <Lock size={15} /> Profile
          </a>
          <a href="#appearance">
            <Palette size={15} /> Appearance
          </a>
          <a href="#notifications">
            <Bell size={15} /> Notifications
          </a>
          <a href="#security">
            <Lock size={15} /> Password
          </a>
          <a href="#danger">
            <TriangleAlert size={15} /> Danger zone
          </a>
        </nav>

        <div>
          <div className="card panel" id="profile">
            <h2>Profile</h2>
            <p className="panel-sub">Update your username and email.</p>
            <form onSubmit={saveProfile}>
              {profileErr && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{profileErr}</p>}
              {profileMsg && <p style={{ color: 'var(--success)', marginBottom: 12 }}>{profileMsg}</p>}
              <div className="field">
                <label htmlFor="set-username">Username</label>
                <input
                  id="set-username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="set-email">Email</label>
                <input
                  id="set-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="card panel" id="appearance">
            <h2>Appearance</h2>
            <p className="panel-sub">Choose how Folio looks on this device.</p>
            <div className="theme-row">
              {THEMES.map(({ id, label, Icon, previewClass }) => (
                <button
                  key={id}
                  type="button"
                  className={`theme-opt${theme === id ? ' active' : ''}`}
                  onClick={() => setTheme(id)}
                >
                  <div className={`theme-preview ${previewClass}`} />
                  <span>
                    <Icon size={13} /> {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card panel" id="notifications">
            <h2>Notifications</h2>
            <p className="panel-sub">Control what Folio sends you. (Local preferences only.)</p>
            <div className="pref-row">
              <div className="pref-row-label">
                <b>Daily study reminder</b>
                <span>A nudge if you haven&apos;t studied yet today</span>
              </div>
              <button
                type="button"
                className={`toggle${dailyReminder ? ' on' : ''}`}
                aria-label="Toggle daily study reminder"
                onClick={() => setDailyReminder(v => !v)}
              />
            </div>
            <div className="pref-row">
              <div className="pref-row-label">
                <b>Quiz results</b>
                <span>Email a summary after each quiz</span>
              </div>
              <button
                type="button"
                className={`toggle${quizResults ? ' on' : ''}`}
                aria-label="Toggle quiz results notifications"
                onClick={() => setQuizResults(v => !v)}
              />
            </div>
            <div className="pref-row">
              <div className="pref-row-label">
                <b>Product updates</b>
                <span>New features and tips</span>
              </div>
              <button
                type="button"
                className={`toggle${productUpdates ? ' on' : ''}`}
                aria-label="Toggle product updates"
                onClick={() => setProductUpdates(v => !v)}
              />
            </div>
          </div>

          <div className="card panel" id="security">
            <h2>Password</h2>
            <p className="panel-sub">Update the password you use to log in.</p>
            <form onSubmit={changePassword}>
              {pwErr && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{pwErr}</p>}
              {pwMsg && <p style={{ color: 'var(--success)', marginBottom: 12 }}>{pwMsg}</p>}
              <div className="field">
                <label htmlFor="cur-pw">Current password</label>
                <input
                  id="cur-pw"
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="new-pw">New password</label>
                <input
                  id="new-pw"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="confirm-pw">Confirm new password</label>
                <input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="card panel danger-panel" id="danger">
            <h2 style={{ color: 'var(--danger)' }}>Danger zone</h2>
            <p className="panel-sub">These actions are permanent and cannot be undone.</p>
            <div className="danger-row">
              <p>
                <b style={{ color: 'var(--text)' }}>Log out / leave account</b>
                <br />
                Account deletion is not exposed by the API yet — you can log out here.
              </p>
              <button type="button" className="btn btn-danger-soft" onClick={handleDelete}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
