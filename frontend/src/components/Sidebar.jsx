import React from 'react'
import { NavLink } from 'react-router-dom'

const LinkItem = ({to, children}) => (
  <NavLink to={to} className={({isActive}) => isActive ? 'link active' : 'link'}>{children}</NavLink>
)

export default function Sidebar(){
  return (
    <div>
      <LinkItem to="/dashboard">Home</LinkItem>
      <LinkItem to="/documents">Library</LinkItem>
      <LinkItem to="/chat">Chats</LinkItem>
      <LinkItem to="/quiz">Quizzes</LinkItem>
      <LinkItem to="/upload">Upload</LinkItem>
      <hr/>
      <LinkItem to="/settings">Settings</LinkItem>
      <LinkItem to="/profile">Profile</LinkItem>
    </div>
  )
}
