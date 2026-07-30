import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div style={{maxWidth:1100,margin:'36px auto',padding:'0 16px'}}>
      <section style={{display:'grid',gridTemplateColumns:'1fr 0.9fr',gap:40,alignItems:'center'}}>
        <div>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#F1F4FF',padding:'8px 12px',borderRadius:999,fontWeight:700,color:'#333'}}>AI Learning Platform</div>
          <h1 style={{fontSize:44,margin:'18px 0'}}>Turn Any PDF Into Your <em style={{color:'#6D64EE',fontStyle:'normal'}}>Personal Teacher</em></h1>
          <p style={{color:'#6B7280',fontSize:18,maxWidth:520}}>Upload a textbook, a paper, or your class notes. Folio reads it, explains it in plain language, and quizzes you until it sticks.</p>
          <div style={{marginTop:22}}>
            <Link to="/register" className="btn btn-primary" style={{marginRight:12}}>Get Started</Link>
            <Link to="/login" className="btn btn-ghost">Login</Link>
          </div>
        </div>
        <div>
          <div style={{height:300,background:'#fff',border:'1px solid #E6E9EE',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>Hero visual placeholder</div>
        </div>
      </section>
    </div>
  )
}
