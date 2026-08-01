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
} from 'lucide-react'
import { documentsApi, chatApi, mediaUrl } from '../../api'
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

  const openChat = async () => {
    if (!doc) return
    const isReady = ['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase())
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
            <span className="badge badge-success">
              <span className="badge-dot" />
              {doc.status || 'UPLOADED'}
            </span>
          </div>
          <div className="doc-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={openChat}
              disabled={busy || !['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase())}
            >
              <MessageSquareText size={16} />
              {busy ? 'Opening…' : ['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase()) ? 'Open Chat' : 'Waiting for processing'}
            </button>
            <Link to="/quiz" className="btn btn-soft">
              <ListChecks size={16} /> Quizzes
            </Link>
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
            <p>
              This PDF is saved in your library. Open chat to ask questions about it, or start a
              quiz from your quiz list. AI summaries and chapter extraction will appear here once
              processing is wired up on the backend.
            </p>
          </div>
        </div>

        <div>
          <div className="card panel">
            <h2>
              <Info size={17} style={{ color: 'var(--primary)' }} /> Details
            </h2>
            <div className="toc-list">
              <div className="toc-item">
                <span className="name">Owner</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.owner || '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Language</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.language || '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Status</span>
                <span style={{ color: 'var(--text-muted)' }}>{doc.status || '—'}</span>
              </div>
              <div className="toc-item">
                <span className="name">Uploaded</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploaded_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
