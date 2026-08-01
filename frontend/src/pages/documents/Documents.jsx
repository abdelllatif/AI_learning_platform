import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Globe,
  PlusCircle,
  Trash2,
  Pencil,
} from 'lucide-react'
import { documentsApi } from '../../api'
import './documents.css'

const SPINES = ['#C0392B', '#4F46E5', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6']

function statusMeta(status) {
  const s = (status || '').toUpperCase()
  if (s === 'READY' || s === 'PROCESSED') {
    return { label: 'Ready', className: 'badge-success', openClass: 'btn-soft' }
  }
  if (s === 'PROCESSING') {
    return { label: 'Processing', className: 'badge-warning', openClass: 'btn-ghost', dim: true }
  }
  return { label: status || 'Uploaded', className: 'badge-warning', openClass: 'btn-soft' }
}

function formatDate(iso) {
  if (!iso) return ''
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

function BookCard({ doc, index, onRename, onDelete }) {
  const meta = statusMeta(doc.status)
  const spine = SPINES[index % SPINES.length]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="card book-card" style={{ position: 'relative' }}>
      <Link to={`/document/${doc.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <div className="book-spine" style={{ background: spine }} />
        <div className="book-top">
          <div
            className="book-icon"
            style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}
          >
            <FileText />
          </div>
        </div>
        <h3>{doc.title}</h3>
        <div className="book-meta">
          <span>
            <Globe size={12} />
            {doc.language || 'Unknown'}
          </span>
          <span>{formatDate(doc.uploaded_at)}</span>
        </div>
        <div className="book-foot">
          <span className={`badge ${meta.className}`}>
            <span className="badge-dot" />
            {meta.label}
          </span>
          <span
            className={`btn ${meta.openClass} btn-sm`}
            style={meta.dim ? { opacity: 0.5 } : undefined}
          >
            Open
          </span>
        </div>
      </Link>
      <button
        type="button"
        className="icon-menu"
        style={{ position: 'absolute', top: 14, right: 14 }}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setMenuOpen(v => !v)
        }}
      >
        <MoreHorizontal size={16} />
      </button>
      {menuOpen && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 44,
            right: 14,
            zIndex: 5,
            padding: 6,
            minWidth: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block"
            style={{ justifyContent: 'flex-start', gap: 8 }}
            onClick={() => {
              setMenuOpen(false)
              onRename(doc)
            }}
          >
            <Pencil size={14} /> Rename
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block"
            style={{ justifyContent: 'flex-start', gap: 8, color: 'var(--danger)' }}
            onClick={() => {
              setMenuOpen(false)
              onDelete(doc)
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ordering, setOrdering] = useState('-uploaded_at')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'My Library — Folio'
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await documentsApi.list({
        search: search.trim() || undefined,
        ordering,
      })
      const results = Array.isArray(data) ? data : data?.results || []
      setDocs(results)
      setCount(data?.count ?? results.length)
    } catch (err) {
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [search, ordering])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return docs
    if (statusFilter === 'ready') {
      return docs.filter(d => ['READY', 'PROCESSED'].includes((d.status || '').toUpperCase()))
    }
    return docs.filter(d => !['READY', 'PROCESSED'].includes((d.status || '').toUpperCase()))
  }, [docs, statusFilter])

  const handleRename = async doc => {
    const next = window.prompt('Rename document', doc.title)
    if (!next || next.trim() === doc.title) return
    try {
      await documentsApi.rename(doc.id, next.trim())
      await load()
    } catch (err) {
      window.alert(err.message || 'Rename failed')
    }
  }

  const handleDelete = async doc => {
    if (!window.confirm(`Delete “${doc.title}”? This cannot be undone.`)) return
    try {
      await documentsApi.remove(doc.id)
      await load()
    } catch (err) {
      window.alert(err.message || 'Delete failed')
    }
  }

  return (
    <>
      <div className="lib-head">
        <div>
          <h1>My Library</h1>
          <p>
            {count} document{count === 1 ? '' : 's'}
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={16} /> Upload PDF
        </Link>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search your library…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button
            type="button"
            className={`chip${statusFilter === 'all' ? ' active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`chip${statusFilter === 'ready' ? ' active' : ''}`}
            onClick={() => setStatusFilter('ready')}
          >
            <span className="badge-dot" style={{ color: '#10B981' }} />
            Ready
          </button>
          <button
            type="button"
            className={`chip${statusFilter === 'processing' ? ' active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            <span className="badge-dot" style={{ color: '#F59E0B' }} />
            Processing
          </button>
        </div>
        <select
          className="sort-select"
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
        >
          <option value="-uploaded_at">Recently added</option>
          <option value="uploaded_at">Oldest first</option>
          <option value="title">A–Z</option>
          <option value="-title">Z–A</option>
        </select>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: 'var(--text-faint)' }}>Loading library…</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="shelf-label">
          <h2>No documents yet</h2>
          <p style={{ color: 'var(--text-faint)', marginTop: 8 }}>
            Upload a PDF to start building your library.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="shelf-label">
            <h2>All documents</h2>
          </div>
          <div className="book-grid">
            {filtered.map((doc, i) => (
              <BookCard
                key={doc.id}
                doc={doc}
                index={i}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
            <Link to="/upload" className="empty-add">
              <PlusCircle size={26} />
              <b style={{ fontSize: '13.5px' }}>Add a document</b>
            </Link>
          </div>
        </>
      )}
    </>
  )
}
