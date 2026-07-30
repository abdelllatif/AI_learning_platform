import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <div>Folio</div>
          <nav>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link to="/login">Login</Link>
          </nav>
        </div>
        <div className="landing-footer-copy">© {new Date().getFullYear()} Folio — Built for learning</div>
      </div>
    </footer>
  )
}
