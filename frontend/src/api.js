const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function apiFetch(path, opts={}){
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json().catch(()=>null)
}

export default { apiFetch }
