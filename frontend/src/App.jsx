import React from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Upload from './pages/Upload'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Footer from './components/Footer'

export default function App(){
  return (
    <div>
      <div className="topnav"><Nav /></div>
      <div className="app-shell">
        <aside className="sidebar"><Sidebar /></aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/documents" element={<Documents/>} />
            <Route path="/upload" element={<Upload/>} />
            <Route path="/chat" element={<Chat/>} />
            <Route path="/quiz" element={<Quiz/>} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  )
}
