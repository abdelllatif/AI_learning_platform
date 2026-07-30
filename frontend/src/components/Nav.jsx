import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav(){
  return (
    <div className="landing-nav">
      <Link to="/" className="landing-brand">Folio</Link>
      <nav className="landing-links">
        <a href="#how">How it works</a>
        <a href="#features">Features</a>
        <Link to="/dashboard">App</Link>
      </nav>
      <div className="landing-actions">
        <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
      </div>
    </div>
  )
}
