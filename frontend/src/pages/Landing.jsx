import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">AI Learning Platform</span>
          <h1>Turn any PDF into a <span>personal teacher</span></h1>
          <p>Upload your textbook, lecture notes, or research paper. Folio explains concepts, quizzes you, and helps you study with less effort.</p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Login</Link>
          </div>
          <div className="trust-row">
            <div>Trusted by students across 200+ courses</div>
            <div>Easy import, AI summaries, smart quizzes</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="card-title">Smart Study</div>
            <p>Automatic guides, summaries, and practice problems from your own notes.</p>
          </div>
          <div className="hero-card hero-card-2">
            <div className="card-title">Chat with your material</div>
            <p>Ask questions about any section and get explanations in simple language.</p>
          </div>
          <div className="hero-screen">
            <div className="hero-screen-header">
              <span>Folio</span>
              <div className="hero-dot-group">
                <span className="hero-dot"></span>
                <span className="hero-dot"></span>
                <span className="hero-dot"></span>
              </div>
            </div>
            <div className="hero-screen-body">
              <h3>Chapter summary</h3>
              <p>Folio breaks your PDF into digestible study cards and quizzes you on the key ideas.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="feature-section">
        <div className="section-header">
          <span className="eyebrow">How it works</span>
          <h2>From upload to understanding in minutes</h2>
        </div>
        <div className="feature-grid">
          <article className="step-card">
            <div className="step-number">1</div>
            <h3>Upload your document</h3>
            <p>Drop a PDF, notes, or textbook and let Folio analyze the content instantly.</p>
          </article>
          <article className="step-card">
            <div className="step-number">2</div>
            <h3>Read smart summaries</h3>
            <p>Get the main ideas, definitions, and examples without re-reading every page.</p>
          </article>
          <article className="step-card">
            <div className="step-number">3</div>
            <h3>Practice with quizzes</h3>
            <p>Review with auto-generated questions that test your understanding of the material.</p>
          </article>
        </div>
      </section>

      <section id="features" className="feature-section alt">
        <div className="section-header">
          <span className="eyebrow">Features</span>
          <h2>Everything you need for smarter revision</h2>
        </div>
        <div className="feature-grid feature-grid-2">
          <article className="feature-card">
            <h3>PDF uploading</h3>
            <p>Import slides, PDFs, or notes and let Folio turn them into study material.</p>
          </article>
          <article className="feature-card">
            <h3>AI-powered summaries</h3>
            <p>Short, clear explanations and easy-to-follow takeaways for every topic.</p>
          </article>
          <article className="feature-card">
            <h3>Interactive quizzes</h3>
            <p>Practice with questions tailored to the uploaded content and your study goals.</p>
          </article>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Start learning faster with Folio</h2>
          <p>Sign up now and turn your study material into a smarter review system.</p>
        </div>
        <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
      </section>
    </div>
  )
}
