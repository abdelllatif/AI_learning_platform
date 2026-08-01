import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { documentsApi } from '../../api'
import './upload.css'

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

export default function Upload() {
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploadItems, setUploadItems] = useState([])
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Upload — Folio'
  }, [])

  const loadRecent = useCallback(async () => {
    try {
      const data = await documentsApi.list({ ordering: '-uploaded_at' })
      const results = Array.isArray(data) ? data : data?.results || []
      setRecent(results.slice(0, 5))
    } catch {
      /* ignore for recent strip */
    }
  }, [])

  useEffect(() => {
    loadRecent()
  }, [loadRecent])

  const uploadFile = useCallback(
    async file => {
      if (!file) return
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed.')
        return
      }

      const id = `${Date.now()}-${Math.random()}`
      setError('')
      setUploadItems(prev => [{ id, name: file.name, pct: 15, done: false, failed: false }, ...prev])

      const tick = setInterval(() => {
        setUploadItems(prev =>
          prev.map(item =>
            item.id === id && !item.done && !item.failed && item.pct < 90
              ? { ...item, pct: Math.min(90, item.pct + 12) }
              : item
          )
        )
      }, 280)

      try {
        await documentsApi.upload(file)
        clearInterval(tick)
        setUploadItems(prev =>
          prev.map(item => (item.id === id ? { ...item, pct: 100, done: true } : item))
        )
        await loadRecent()
      } catch (err) {
        clearInterval(tick)
        setUploadItems(prev =>
          prev.map(item => (item.id === id ? { ...item, pct: 100, failed: true } : item))
        )
        setError(err.message || 'Upload failed')
      }
    },
    [loadRecent]
  )

  const handleDragEnter = e => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragOver = e => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files.length) uploadFile(files[0])
  }

  const handleDropzoneClick = e => {
    if (e.target.tagName !== 'LABEL') fileInputRef.current?.click()
  }

  const handleDropzoneKeyDown = e => {
    if (e.key === 'Enter') fileInputRef.current?.click()
  }

  const handleFileChange = e => {
    if (e.target.files.length) uploadFile(e.target.files[0])
    e.target.value = ''
  }

  return (
    <div className="upload-wrap">
      <div className="upload-head">
        <h1>Add a new book to your library</h1>
        <p>Upload a PDF and Folio will read it, summarize it, and get it ready to chat and quiz.</p>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', marginBottom: 16 }} role="alert">
          {error}
        </p>
      )}

      <div
        className={`dropzone${dragging ? ' drag' : ''}`}
        tabIndex={0}
        role="button"
        aria-label="Upload a PDF"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
        onKeyDown={handleDropzoneKeyDown}
      >
        <div className="dz-icon">
          <UploadCloud size={34} />
        </div>
        <h3>Drag & drop your PDF here</h3>
        <p>or click to browse your files</p>
        <label className="btn btn-primary" htmlFor="file-input">
          Choose PDF
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="file-input"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <div className="dz-formats">PDF only · Up to 10MB per file</div>
      </div>

      {uploadItems.length > 0 && (
        <div className="upload-list">
          {uploadItems.map(item => (
            <div key={item.id} className="card upload-item">
              <div className="doc-icon">
                <FileText size={20} />
              </div>
              <div className="grow">
                <b>{item.name}</b>
                <div className="upload-track">
                  <div
                    className={`upload-fill${item.done ? ' done' : ''}`}
                    style={{
                      width: `${item.pct}%`,
                      background: item.failed ? 'var(--danger)' : undefined,
                    }}
                  />
                </div>
                <div className="pct">
                  <span>
                    {item.failed ? 'Failed' : item.done ? 'Done' : 'Uploading…'}
                  </span>
                  <span>{Math.floor(item.pct)}%</span>
                </div>
              </div>
              <div className="status-icon">
                {item.done && <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />}
                {item.failed && <AlertCircle size={22} style={{ color: 'var(--danger)' }} />}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="recent-uploads">
        <h2>Recently added</h2>
        <div className="upload-list">
          {recent.length === 0 && (
            <p style={{ color: 'var(--text-faint)' }}>No uploads yet.</p>
          )}
          {recent.map(doc => (
            <Link key={doc.id} to={`/document/${doc.id}`} className="card upload-item">
              <div
                className="doc-icon"
                style={{ background: 'var(--success-tint)', color: '#067A55' }}
              >
                <FileText size={20} />
              </div>
              <div className="grow">
                <b>{doc.title}</b>
                <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                  {doc.language || 'Unknown'} · {formatDate(doc.uploaded_at)}
                </span>
              </div>
              <span className="badge badge-success">
                <span className="badge-dot" />
                {doc.status || 'UPLOADED'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
