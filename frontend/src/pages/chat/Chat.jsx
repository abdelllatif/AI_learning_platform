import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Sparkles,
  MoreHorizontal,
  ArrowUp,
  Plus,
  Trash2,
} from 'lucide-react'
import { chatApi, documentsApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './chat.css'

function TypingIndicator() {
  return (
    <div className="typing">
      <span />
      <span />
      <span />
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const messagesRef = useRef(null)
  const [chats, setChats] = useState([])
  const [documents, setDocuments] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [docsLoading, setDocsLoading] = useState(true)
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const uploadInputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const loadChats = useCallback(async () => {
    const data = await chatApi.list({ ordering: '-updated_at' })
    const results = Array.isArray(data) ? data : data?.results || []
    setChats(results)
    return results
  }, [])

  const loadDocuments = useCallback(async () => {
    try {
      const data = await documentsApi.list({ ordering: '-uploaded_at' })
      const results = Array.isArray(data) ? data : data?.results || []
      setDocuments(results)
      return results
    } finally {
      setDocsLoading(false)
    }
  }, [])

  const readyDocuments = useMemo(
    () => documents.filter(doc => ['READY', 'PROCESSED'].includes((doc.status || '').toUpperCase())),
    [documents]
  )

  const createChat = async document => {
    try {
      const chat = await chatApi.create({ document: document.id })
      await loadChats()
      navigate(`/chat/${chat.id}`)
    } catch (err) {
      window.alert(err.message || 'Could not create chat')
    }
  }

  const loadChat = useCallback(async chatId => {
    const detail = await chatApi.get(chatId)
    setActiveChat(detail)
    setMessages(detail.messages || [])
    document.title = `${detail.title || 'Chat'} — Folio`
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [list] = await Promise.all([loadChats(), loadDocuments()])
        if (cancelled) return

        if (id) {
          await loadChat(id)
        } else if (list.length) {
          navigate(`/chat/${list[0].id}`, { replace: true })
        } else {
          setActiveChat(null)
          setMessages([])
          document.title = 'Chat — Folio'
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load chats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, loadChats, loadChat, loadDocuments, navigate])

  const deleteChat = async () => {
    if (!activeChat) return
    if (!window.confirm(`Delete “${activeChat.title}”?`)) return
    try {
      await chatApi.remove(activeChat.id)
      const list = await loadChats()
      if (list.length) navigate(`/chat/${list[0].id}`, { replace: true })
      else {
        setActiveChat(null)
        setMessages([])
        navigate('/chat', { replace: true })
      }
    } catch (err) {
      window.alert(err.message || 'Delete failed')
    }
  }

  const sendMessage = useCallback(async () => {
    const text = draft.trim()
    if (!text || !activeChat || sending) return

    setSending(true)
    setDraft('')
    setMessages(prev => [
      ...prev,
      {
        id: `temp-user-${Date.now()}`,
        sender: 'user',
        content: text,
        created_at: new Date().toISOString(),
      },
      { id: `temp-typing-${Date.now()}`, sender: 'ai', typing: true },
    ])

    try {
      await chatApi.sendUserMessage(activeChat.id, text)
      const msgs = await chatApi.messages(activeChat.id)
      setMessages(Array.isArray(msgs) ? msgs : [])
      await loadChats()
    } catch (err) {
      setMessages(prev => prev.filter(m => !String(m.id).startsWith('temp-')))
      window.alert(err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }, [draft, activeChat, sending, loadChats])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const uploadDocument = async file => {
    if (!file) return
    setUploadError('')
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed.')
      return
    }

    setUploading(true)
    try {
      await documentsApi.upload(file)
      await loadDocuments()
      setUploadError('')
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const openUploadPicker = () => uploadInputRef.current?.click()

  const handleUploadChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      uploadDocument(file)
    }
    e.target.value = ''
  }

  const initial = (user?.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="chat-shell">
      <aside className="ctx-panel">
        <Link to="/documents" className="ctx-back">
          <ArrowLeft size={14} />
          Back to library
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <b style={{ fontSize: 14 }}>Your chats</b>
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              Create a chat from a READY document or upload a new PDF.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={() => readyDocuments[0] && createChat(readyDocuments[0])}
            disabled={readyDocuments.length === 0}
          >
            <Plus size={14} /> New
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, maxHeight: 220, overflow: 'auto' }}>
          {chats.map(c => (
            <Link
              key={c.id}
              to={`/chat/${c.id}`}
              className="suggest-q"
              style={{
                textAlign: 'left',
                background: String(c.id) === String(id) ? 'var(--primary-tint)' : undefined,
              }}
            >
              {c.title || `Chat #${c.id}`}
            </Link>
          ))}
          {!loading && chats.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
              No chats yet. Create one from a READY document below.
            </p>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <b style={{ fontSize: 14 }}>Ready documents</b>
            <Link to="/documents" className="btn btn-ghost btn-sm">
              Manage
            </Link>
          </div>
          {docsLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Loading documents…</p>
          ) : readyDocuments.length > 0 ? (
            readyDocuments.slice(0, 4).map(doc => (
              <button
                key={doc.id}
                type="button"
                className="suggest-q"
                style={{ textAlign: 'left', width: '100%' }}
                onClick={() => createChat(doc)}
              >
                {doc.title}
              </button>
            ))
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                No READY documents yet. Upload a PDF to begin.
              </p>
              <Link to="/upload" className="btn btn-primary btn-block btn-sm">
                Upload PDF
              </Link>
            </div>
          )}
        </div>

        <div className="ctx-block">
          <div className="ctx-block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 13, margin: 0, color: 'var(--text-muted)' }}>New document</h3>
            <button type="button" onClick={openUploadPicker} className="btn btn-soft btn-sm" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload PDF'}
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            Upload your PDF directly from chat and create a document that you can ask questions about.
          </p>
          <input
            ref={uploadInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleUploadChange}
          />
          {uploadError && (
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)' }}>{uploadError}</p>
          )}
        </div>

        <div className="ctx-doc">
          <div className="ctx-doc-icon">
            <FileText size={22} />
          </div>
          <div>
            <h2>{activeChat?.title || 'No chat selected'}</h2>
            <span>
              {activeChat
                ? activeChat.document_title
                  ? `Document: ${activeChat.document_title}`
                  : 'Conversation'
                : 'Create a chat to begin'}
            </span>
          </div>
        </div>

        <Link to="/quiz" className="btn btn-soft btn-block btn-sm" style={{ marginTop: 16 }}>
          <ListChecks size={15} />
          Go to Quizzes
        </Link>
      </aside>

      <section className="chat-col">
        <div className="chat-topbar">
          <div>
            <b>{activeChat?.title || 'Chat'}</b>
            {activeChat && (
              <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                <span className="badge-dot" />
                Live
              </span>
            )}
          </div>
          {activeChat && (
            <button type="button" className="btn-icon" aria-label="Delete chat" onClick={deleteChat}>
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {error && <p style={{ padding: 16, color: 'var(--danger)' }}>{error}</p>}
        {loading && <p style={{ padding: 16, color: 'var(--text-faint)' }}>Loading…</p>}

        <div className="messages" ref={messagesRef}>
          {!loading && activeChat && messages.length === 0 && (
            <div className="msg-row ai">
              <div className="msg-avatar ai">
                <Sparkles size={15} />
              </div>
              <div>
                <div className="bubble">
                  Start the conversation — ask anything. Replies are saved to this chat.
                </div>
              </div>
            </div>
          )}

          {messages.map(msg => {
            const role = msg.sender === 'user' || msg.role === 'user' ? 'user' : 'ai'
            return (
              <div key={msg.id} className={`msg-row ${role}`}>
                <div className={`msg-avatar ${role === 'ai' ? 'ai' : 'me'}`}>
                  {role === 'ai' ? <Sparkles size={15} /> : initial}
                </div>
                <div>
                  <div className="bubble">
                    {msg.typing ? <TypingIndicator /> : msg.content}
                  </div>
                  {msg.created_at && !msg.typing && (
                    <div className="bubble-time">{formatTime(msg.created_at)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="composer">
          <div className="composer-box">
            <textarea
              rows={1}
              placeholder={activeChat ? 'Ask anything…' : 'Create a chat first…'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!activeChat || sending}
            />
            <button
              type="button"
              className="send-btn"
              aria-label="Send message"
              onClick={sendMessage}
              disabled={!activeChat || sending || !draft.trim()}
            >
              <ArrowUp size={18} />
            </button>
          </div>
          <div className="composer-hint">
            Messages are stored via the API. AI replies are currently a static backend stub.
          </div>
        </div>
      </section>
    </div>
  )
}
