import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav(){
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link to="/dashboard" style={{fontWeight:700,color:'#333',textDecoration:'none'}}>Folio</Link>
        <nav className="nav-links">
          <Link to="/documents">Library</Link>
          <Link to="/chat">Chats</Link>
          <Link to="/quiz">Quizzes</Link>
        </nav>
      </div>
      <div>
        <Link to="/profile" style={{marginRight:12}}>Profile</Link>
        <Link to="/settings">Settings</Link>
      </div>
    </div>
  )
}
