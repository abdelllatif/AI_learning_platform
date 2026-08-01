import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Library,
  MessageSquareText,
  ListChecks,
  Flame,
  ChevronRight,
  FileText,
  UploadCloud,
} from 'lucide-react'
import { documentsApi, chatApi, quizApi } from '../../api'
import './dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ docs: 0, chats: 0, quizzes: 0, streak: '—' })
  const [recentDocs, setRecentDocs] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])

  useEffect(() => {
    document.title = 'Dashboard — Folio'
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [docsData, chatsData, quizData] = await Promise.all([
          documentsApi.list({ ordering: '-uploaded_at' }),
          chatApi.list({ ordering: '-updated_at' }),
          quizApi.history({ ordering: '-started_at' }),
        ])
        if (cancelled) return
        const docsResults = Array.isArray(docsData) ? docsData : docsData?.results || []
        const chatsResults = Array.isArray(chatsData) ? chatsData : chatsData?.results || []
        const quizResults = Array.isArray(quizData) ? quizData : quizData?.results || []
        setStats({
          docs: docsData?.count ?? docsResults.length,
          chats: chatsData?.count ?? chatsResults.length,
          quizzes: quizData?.count ?? quizResults.length,
          streak: '3-day',
        })
        setRecentDocs(docsResults.slice(0, 3))
        setRecentChats(chatsResults.slice(0, 3))
        setRecentQuizzes(quizResults.slice(0, 3))
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <div className="greet-row">
        <div>
          <h1>Good evening, Abdellatif 👋</h1>
          <p>You've studied 3 days in a row. Let's keep it going.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={16} /> Upload PDF
        </Link>
      </div>

      <div className="stat-strip">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
            <Library size={22} />
          </div>
          <div>
            <b>{stats.docs}</b>
            <span>Documents</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-tint)', color: '#067A55' }}>
            <MessageSquareText size={22} />
          </div>
          <div>
            <b>{stats.chats}</b>
            <span>Chats</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-tint)', color: '#9A6205' }}>
            <ListChecks size={22} />
          </div>
          <div>
            <b>{stats.quizzes}</b>
            <span>Quizzes taken</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-tint-2)', color: 'var(--primary-dark)' }}>
            <Flame size={22} />
          </div>
          <div>
            <b>{stats.streak}</b>
            <span>Study streak</span>
          </div>
        </div>
      </div>

      <section className="dash-block">
        <div className="section-title-row">
          <h2>Recent documents</h2>
          <Link to="/documents">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="doc-grid">
          <Link to="/upload" className="upload-tile">
            <div className="doc-icon">
              <UploadCloud size={22} />
            </div>
            <b>Upload PDF</b>
            <span style={{ fontSize: 12 }}>Drag & drop or browse</span>
          </Link>
          {recentDocs.map(doc => (
            <Link key={doc.id} to={`/document/${doc.id}`} className="card doc-card">
              <div className="doc-card-top">
                <div className="doc-icon" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
                  <FileText size={22} />
                </div>
                <span className={`badge ${['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase()) ? 'badge-success' : 'badge-warning'}`}>
                  <span className="badge-dot" />
                  {doc.status || 'Uploaded'}
                </span>
              </div>
              <div>
                <h3>{doc.title}</h3>
                <span className="meta">{doc.language || 'Unknown'} · Uploaded</span>
              </div>
            </Link>
          ))}
          {recentDocs.length === 0 && (
            <div className="card doc-card" style={{ padding: 24 }}>
              <h3>No recent documents</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Upload a PDF to create a document and start chatting.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="dash-block">
        <div className="section-title-row">
          <h2>Recent chats</h2>
          <Link to="/chat">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="chat-list">
          {recentChats.length > 0 ? (
            recentChats.map(chat => (
              <Link key={chat.id} to={`/chat/${chat.id}`} className="card chat-row">
                <div className="doc-thumb" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
                  <FileText size={18} />
                </div>
                <div className="grow">
                  <b>{chat.title || `Chat #${chat.id}`}</b>
                  <p>{chat.last_message?.content || 'Start the conversation.'}</p>
                </div>
                <span className="time">
                  {chat.last_message?.created_at ? new Date(chat.last_message.created_at).toLocaleDateString() : ''}
                </span>
              </Link>
            ))
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <h3>No chats yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Create a chat from a READY document or upload a new PDF first.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="dash-block">
        <div className="section-title-row">
          <h2>Recent quizzes</h2>
          <Link to="/quiz">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="quiz-grid">
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map(attempt => (
              <Link key={attempt.id} to="/quiz/result" className="card quiz-card">
                <div
                  className="score-ring"
                  style={{
                    background: attempt.score >= 70 ? 'var(--success-tint)' : 'var(--warning-tint)',
                    color: attempt.score >= 70 ? '#067A55' : '#9A6205',
                  }}
                >
                  {Math.round(attempt.score)}%
                </div>
                <div>
                  <h3>{attempt.quiz_title || 'Quiz'}</h3>
                  <span>{new Date(attempt.finished_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <h3>No quiz history</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Complete a quiz from the chat or document page to see your results.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
