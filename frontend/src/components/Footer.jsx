import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer style={{borderTop:'1px solid #E6E9EE',padding:'28px',background:'#FBFCFE'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontWeight:700}}>Folio</div>
          <nav style={{display:'flex',gap:12,color:'#6B7280'}}>
            <Link to="/">Home</Link>
            <Link to="/documents">Library</Link>
            <Link to="/login">Login</Link>
          </nav>
        </div>
        <div style={{color:'#6B7280'}}>© {new Date().getFullYear()} Folio — Built for learning</div>
      </div>
    </footer>
  )
}
