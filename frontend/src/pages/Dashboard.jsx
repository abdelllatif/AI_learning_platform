import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good evening, Abdellatif 👋</h1>
          <p className="page-subtitle">You've studied 3 days in a row. Keep your streak going with a new PDF, quiz, or chat review.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">Upload PDF</Link>
      </div>

      <div className="stats-grid">
        <div className="card stats-card">
          <span style={{color:'#6D64EE'}}>Documents</span>
          <b>14</b>
          <span style={{color:'#6B7280'}}>In your library</span>
        </div>
        <div className="card stats-card">
          <span style={{color:'#0F766E'}}>Chats</span>
          <b>27</b>
          <span style={{color:'#6B7280'}}>Conversations started</span>
        </div>
        <div className="card stats-card">
          <span style={{color:'#B45309'}}>Quizzes</span>
          <b>19</b>
          <span style={{color:'#6B7280'}}>Taken so far</span>
        </div>
        <div className="card stats-card">
          <span style={{color:'#4B5563'}}>Streak</span>
          <b>3-day</b>
          <span style={{color:'#6B7280'}}>Study streak</span>
        </div>
      </div>

      <div className="section-title">
        <h2>Recent items</h2>
        <Link to="/documents" className="btn btn-ghost">View library</Link>
      </div>

      <div className="grid-3">
        <div className="card">
          <h3 style={{margin:'0 0 10px'}}>Java Fundamentals.pdf</h3>
          <p style={{color:'#6B7280',margin:0}}>Continue reading chapter 4, or jump to chat for quick explanations.</p>
        </div>
        <div className="card">
          <h3 style={{margin:'0 0 10px'}}>Linear Algebra.pdf</h3>
          <p style={{color:'#6B7280',margin:0}}>Review your notes and generate a short quiz to test concepts.</p>
        </div>
        <div className="card">
          <h3 style={{margin:'0 0 10px'}}>Cell Biology.pdf</h3>
          <p style={{color:'#6B7280',margin:0}}>Start a chat to clarify mitosis and cell division details.</p>
        </div>
      </div>
    </div>
  )
}
