import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, clearTokens, getAccessToken, getRefreshToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!getAccessToken() && !getRefreshToken()) {
      setUser(null)
      setLoading(false)
      return null
    }
    try {
      const profile = await authApi.profile()
      setUser(profile)
      return profile
    } catch {
      clearTokens()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async ({ username, password }) => {
    await authApi.login({ username, password })
    return loadUser()
  }, [loadUser])

  const register = useCallback(async payload => {
    await authApi.register(payload)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await authApi.profile()
    setUser(profile)
    return profile
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
