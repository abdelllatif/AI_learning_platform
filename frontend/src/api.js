const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const ACCESS_KEY = 'folio_access'
const REFRESH_KEY = 'folio_refresh'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function mediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}

function parseErrorPayload(payload, status) {
  if (!payload) return `Request failed (${status})`
  if (typeof payload === 'string') return payload
  if (payload.detail) return typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail)
  if (payload.errors) return parseErrorPayload(payload.errors, status)
  if (typeof payload === 'object') {
    const parts = Object.entries(payload).flatMap(([key, val]) => {
      const msg = Array.isArray(val) ? val.join(' ') : typeof val === 'object' ? JSON.stringify(val) : String(val)
      return key === 'non_field_errors' ? [msg] : [`${key}: ${msg}`]
    })
    if (parts.length) return parts.join(' · ')
  }
  return `Request failed (${status})`
}

async function readBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('Not authenticated')

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${BASE}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      const data = await readBody(res)
      if (!res.ok) {
        clearTokens()
        throw new Error(parseErrorPayload(data, res.status))
      }
      setTokens({ access: data.access, refresh: data.refresh || refresh })
      return data.access
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {}, formData = false } = {}) {
  const opts = { method, headers: { ...headers } }

  if (body != null) {
    if (formData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = typeof body === 'string' ? body : JSON.stringify(body)
    }
  }

  const doFetch = async token => {
    const reqHeaders = { ...opts.headers }
    if (auth && token) reqHeaders.Authorization = `Bearer ${token}`
    return fetch(`${BASE}${path}`, { ...opts, headers: reqHeaders })
  }

  let res = await doFetch(auth ? getAccessToken() : null)

  if (auth && res.status === 401 && getRefreshToken()) {
    try {
      const next = await refreshAccessToken()
      res = await doFetch(next)
    } catch {
      clearTokens()
      throw new Error('Session expired. Please log in again.')
    }
  }

  if (res.status === 204) return null

  const data = await readBody(res)
  if (!res.ok) {
    const err = new Error(parseErrorPayload(data, res.status))
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

/* ── Auth ─────────────────────────────────────────────── */

export const authApi = {
  register: ({ username, email, password, email_verification = false }) =>
    apiFetch('/api/auth/register/', {
      method: 'POST',
      auth: false,
      body: { username, email, password, email_verification },
    }),

  login: async ({ username, password }) => {
    const data = await apiFetch('/api/token/', {
      method: 'POST',
      auth: false,
      body: { username, password },
    })
    setTokens({ access: data.access, refresh: data.refresh })
    return data
  },

  logout: async () => {
    const refresh = getRefreshToken()
    try {
      if (refresh && getAccessToken()) {
        await apiFetch('/api/auth/logout/', { method: 'POST', body: { refresh } })
      }
    } catch {
      /* still clear locally */
    } finally {
      clearTokens()
    }
  },

  profile: () => apiFetch('/api/auth/profile/'),

  updateProfile: body => apiFetch('/api/auth/profile/', { method: 'PUT', body }),

  changePassword: body =>
    apiFetch('/api/auth/change-password/', { method: 'POST', body }),
}

/* ── Documents ────────────────────────────────────────── */

export const documentsApi = {
  list: (params = {}) => apiFetch(`/api/documents/${qs(params)}`),

  get: id => apiFetch(`/api/documents/${id}/`),

  upload: (file, { title, language } = {}) => {
    const fd = new FormData()
    fd.append('file', file)
    if (title) fd.append('title', title)
    if (language) fd.append('language', language)
    return apiFetch('/api/documents/upload/', { method: 'POST', body: fd, formData: true })
  },

  rename: (id, title) =>
    apiFetch(`/api/documents/${id}/rename/`, { method: 'PATCH', body: { title } }),

  remove: id => apiFetch(`/api/documents/${id}/`, { method: 'DELETE' }),
}

/* ── Chat ─────────────────────────────────────────────── */

export const chatApi = {
  list: (params = {}) => apiFetch(`/api/chat/${qs(params)}`),

  create: ({ title = 'New Chat', document = null } = {}) =>
    apiFetch('/api/chat/', {
      method: 'POST',
      body: document ? { title, document } : { title },
    }),

  get: id => apiFetch(`/api/chat/${id}/`),

  rename: (id, title) =>
    apiFetch(`/api/chat/${id}/rename/`, { method: 'PATCH', body: { title } }),

  remove: id => apiFetch(`/api/chat/${id}/`, { method: 'DELETE' }),

  messages: (chatId, params = {}) =>
    apiFetch(`/api/chat/${chatId}/messages/${qs({ ordering: 'created_at', ...params })}`),

  sendUserMessage: (chatId, content) =>
    apiFetch(`/api/chat/${chatId}/messages/user/`, { method: 'POST', body: { content } }),
}

/* ── Quiz ─────────────────────────────────────────────── */

export const quizApi = {
  list: (params = {}) => apiFetch(`/api/quiz/${qs(params)}`),

  get: id => apiFetch(`/api/quiz/${id}/`),

  create: body => apiFetch('/api/quiz/', { method: 'POST', body }),

  submit: (id, answers) =>
    apiFetch(`/api/quiz/${id}/submit/`, { method: 'POST', body: { answers } }),

  history: (params = {}) => apiFetch(`/api/quiz/history/${qs(params)}`),
}

export default { apiFetch, authApi, documentsApi, chatApi, quizApi }
