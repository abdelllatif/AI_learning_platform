import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer>
      <div className="footer-inner">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark"><i data-lucide="book-open" style={{ width: 17, height: 17 }}></i></span>
          Folio
        </Link>
        <div className="footer-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Get Started</Link>
        </div>
        <span style={{ color: 'var(--text-faint)', fontSize: '13px' }}>© {new Date().getFullYear()} Folio</span>
      </div>
    </footer>
  )
}
