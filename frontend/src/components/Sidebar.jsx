import React from 'react'
import { NavLink } from 'react-router-dom'

const LinkItem = ({to, children}) => (
  <NavLink to={to} className={({isActive}) => isActive ? 'link active' : 'link'}>{children}</NavLink>
)

export default function Sidebar(){
  return (
    <div>
      <div style={{ marginBottom: 22, color: 'var(--text-muted)', fontWeight: 700 }}>Navigation</div>
      <LinkItem to="/dashboard">Dashboard</LinkItem>
      <LinkItem to="/documents">Library</LinkItem>
      <LinkItem to="/chat">Chat</LinkItem>
      <LinkItem to="/quiz">Quiz</LinkItem>
      <div style={{ margin: '24px 0 12px', color: 'var(--text-muted)', fontWeight: 700 }}>Account</div>
      <LinkItem to="/profile">Profile</LinkItem>
      <LinkItem to="/settings">Settings</LinkItem>
    </div>
  )
}
