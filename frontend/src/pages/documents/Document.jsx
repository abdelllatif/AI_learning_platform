import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FileText,
  Globe,
  Calendar,
  MessageSquareText,
  ListChecks,
  Download,
  Trash2,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react'
import { documentsApi, chatApi, quizApi, mediaUrl } from '../../api'
import './document.css'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function Document() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await documentsApi.get(id)
      setDoc(data)
      document.title = `${data.title} — Folio`
    } catch (err) {
      setError(err.message || 'Document not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  // Live polling: refresh every 4s while status is still PROCESSING / UPLOADED
  useEffect(() => {
    const TERMINAL = ['READY', 'PROCESSED', 'FAILED']
    if (!doc || TERMINAL.includes((doc.status || '').toUpperCase())) return

    const interval = setInterval(async () => {
      try {
        const fresh = await documentsApi.get(id)
        setDoc(fresh)
        document.title = `${fresh.title} — Folio`
        if (TERMINAL.includes((fresh.status || '').toUpperCase())) {
          clearInterval(interval)
        }
      } catch {
        clearInterval(interval)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [doc, id])

  const isReady = doc && ['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase())
  const isProcessing = doc && ['PROCESSING', 'UPLOADED'].includes((doc.status || '').toUpperCase())

  const openChat = async () => {
    if (!doc) return
    if (!isReady) {
      window.alert('This document must be READY before you can start a chat.')
      return
    }

    setBusy(true)
    try {
      const chat = await chatApi.create({ document: doc.id })
      navigate(`/chat/${chat.id}`)
    } catch (err) {
      window.alert(err.message || 'Could not create chat')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${doc.title}”?`)) return
    try {
      await documentsApi.remove(doc.id)
      navigate('/documents')
    } catch (err) {
      window.alert(err.message || 'Delete failed')
    }
  }

  const generateQuiz = async () => {
    if (!doc) return
    if (!isReady) {
      window.alert('This document must be READY before you can generate a quiz.')
      return
    }

    setGeneratingQuiz(true)
    try {
      const quiz = await quizApi.generate(doc.id, 5)
      navigate(`/quiz/${quiz.id}`)
    } catch (err) {
      window.alert(err.message || 'Failed to generate quiz')
    } finally {
      setGeneratingQuiz(false)
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--text-faint)' }}>Loading document…</p>
  }

  if (error || !doc) {
    return (
      <div>
        <p style={{ color: 'var(--danger)' }}>{error || 'Not found'}</p>
        <Link to="/documents" className="btn btn-soft">
          Back to library
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/documents">My Library</Link>
        <span className="sep">/</span>
        <span style={{ color: 'var(--text)' }}>{doc.title}</span>
      </div>

      {/* Live processing banner */}
      {isProcessing && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(90deg,#1e293b,#1e3a5f)',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: 20 }}>⚙️</span>
          <div>
            <strong style={{ color: '#93c5fd' }}>Processing your document…</strong>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              AI is extracting text, generating summary, creating embeddings, and building your quiz. This page updates automatically.
            </p>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }}
          />
        </div>
      )}

      <div className="card doc-hero">
        <div className="doc-hero-icon">
          <FileText size={32} />
        </div>
        <div className="doc-hero-body">
          <h1>{doc.title}</h1>
          <div className="doc-meta-row">
            <span className="doc-meta-item">
              <Globe size={16} />
              {doc.language || 'Unknown'}
            </span>
            <span className="doc-meta-item">
              <Calendar size={16} />
              Uploaded {formatDate(doc.uploaded_at)}
            </span>
            {doc.pages && (
              <span className="doc-meta-item">📄 {doc.pages} pages</span>
            )}
            {doc.reading_time && (
              <span className="doc-meta-item">⏱ {doc.reading_time} min read</span>
            )}
            <span className={`badge ${isReady ? 'badge-success' : 'badge-warning'}`}>
              <span className="badge-dot" />
              {doc.status || 'UPLOADED'}
            </span>
          </div>
          <div className="doc-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={openChat}
              disabled={busy || !isReady}
            >
              <MessageSquareText size={16} />
              {busy ? 'Opening…' : isReady ? 'Open Chat' : 'Processing…'}
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={generateQuiz}
              disabled={generatingQuiz || !isReady}
            >
              {generatingQuiz ? (
                <>
                  <Loader2 size={16} className="spin" /> Generating…
                </>
              ) : (
                <>
                  <ListChecks size={16} /> Generate Quiz
                </>
              )}
            </button>
            {doc.file && (
              <a
                className="btn-icon"
                href={mediaUrl(doc.file)}
                target="_blank"
                rel="noreferrer"
                aria-label="Download"
              >
                <Download />
              </a>
            )}
            <button type="button" className="btn-icon" aria-label="Delete" onClick={handleDelete}>
              <Trash2 />
            </button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="card panel">
            <h2>
              <Sparkles size={17} style={{ color: 'var(--primary)' }} /> About this document
            </h2>
            {doc.summary ? (
              <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>{doc.summary}</p>
            ) : (
              <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                {isProcessing ? 'Summary is being generated…' : 'No summary available.'}
              </p>
            )}
            {doc.keywords && doc.keywords.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {doc.keywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: 'var(--primary-tint)',
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card panel">
            <h2>
              <Info size={17} style={{ color: 'var(--primary)' }} /> Details
            </h2>
            <div className="toc-list">
              <div className="toc-item">
                <span className="name">Status</span>
                <span style={{ color: isReady ? '#10b981' : 'var(--text-muted)' }}>{doc.status || '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Language</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.language || '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Pages</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.pages ?? '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Reading time</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.reading_time ? `${doc.reading_time} min` : '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Uploaded</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploaded_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
      `}</style>
    </>
  )
}
