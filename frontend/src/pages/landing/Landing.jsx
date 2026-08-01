import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  UploadCloud,
  BrainCircuit,
  GraduationCap,
  MessageSquareText,
  ListChecks,
  TrendingUp,
  Languages,
} from 'lucide-react'
import './landing.css'

function initHeroScene(canvas) {
  if (!canvas) return () => {}

  const scene = new THREE.Scene()
  const wrap = canvas.parentElement
  let W = wrap.clientWidth
  let H = wrap.clientHeight

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
  camera.position.set(0, 0.4, 8.5)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const coreGeo = new THREE.IcosahedronGeometry(1.15, 1)
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x4f46e5,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
  })
  const core = new THREE.Mesh(coreGeo, coreMat)
  scene.add(core)

  const coreGlowGeo = new THREE.IcosahedronGeometry(1.15, 1)
  const coreGlowMat = new THREE.MeshBasicMaterial({
    color: 0x8b84f5,
    transparent: true,
    opacity: 0.1,
  })
  const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat)
  coreGlow.scale.set(1.5, 1.5, 1.5)
  scene.add(coreGlow)

  const pages = []
  const pageCount = 7
  const pageColors = [0x4f46e5, 0x10b981, 0xf59e0b, 0x7c74f0]
  for (let i = 0; i < pageCount; i++) {
    const geo = new THREE.PlaneGeometry(0.62, 0.82)
    const mat = new THREE.MeshBasicMaterial({
      color: pageColors[i % pageColors.length],
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const edges = new THREE.EdgesGeometry(geo)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    )
    mesh.add(line)

    const radius = 2.6 + Math.random() * 1.1
    const angle = (i / pageCount) * Math.PI * 2
    const tilt = (Math.random() - 0.5) * 1.4

    pages.push({
      mesh,
      radius,
      angle,
      tilt,
      speed: 0.15 + Math.random() * 0.12,
      bob: Math.random() * Math.PI * 2,
    })
    scene.add(mesh)
  }

  const particleCount = 90
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 9
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const pMat = new THREE.PointsMaterial({
    color: 0xc7c4f7,
    size: 0.035,
    transparent: true,
    opacity: 0.5,
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  let mouseX = 0
  let mouseY = 0
  const onMouseMove = e => {
    const rect = wrap.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) / rect.width - 0.5
    mouseY = (e.clientY - rect.top) / rect.height - 0.5
  }
  wrap.addEventListener('mousemove', onMouseMove)

  const clock = new THREE.Clock()
  let frameId = 0

  const animate = () => {
    const t = clock.getElapsedTime()
    core.rotation.y = t * 0.25
    core.rotation.x = t * 0.12
    coreGlow.rotation.y = -t * 0.1

    pages.forEach(p => {
      const a = p.angle + t * p.speed
      p.mesh.position.set(
        Math.cos(a) * p.radius,
        Math.sin(a * 0.6 + p.bob) * 0.5,
        Math.sin(a) * p.radius * 0.55
      )
      p.mesh.rotation.y = a + Math.PI / 2
      p.mesh.rotation.x = p.tilt + Math.sin(t * 0.3 + p.bob) * 0.1
    })

    particles.rotation.y = t * 0.02
    scene.rotation.y += (mouseX * 0.4 - scene.rotation.y) * 0.03
    scene.rotation.x += (-mouseY * 0.25 - scene.rotation.x) * 0.03

    renderer.render(scene, camera)
    frameId = requestAnimationFrame(animate)
  }
  animate()

  const onResize = () => {
    W = wrap.clientWidth
    H = wrap.clientHeight
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    renderer.setSize(W, H)
  }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    wrap.removeEventListener('mousemove', onMouseMove)
    renderer.dispose()
    coreGeo.dispose()
    coreMat.dispose()
    coreGlowGeo.dispose()
    coreGlowMat.dispose()
    pGeo.dispose()
    pMat.dispose()
    pages.forEach(p => {
      p.mesh.geometry.dispose()
      p.mesh.material.dispose()
    })
  }
}

export default function Landing() {
  const canvasRef = useRef(null)

  useEffect(() => {
    document.title = 'Folio — Turn Any PDF Into Your Personal Teacher'
  }, [])

  useEffect(() => {
    return initHeroScene(canvasRef.current)
  }, [])

  return (
    <div className="landing-page">
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <BookOpen size={17} />
            </span>
            Folio
          </Link>

          <nav className="lp-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link to="/dashboard">App</Link>
            <Link to="/login">Login</Link>
          </nav>

          <div className="lp-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">
                <Sparkles size={14} /> AI Learning Platform
              </span>
              <h1>
                Turn Any PDF Into Your <em>Personal Teacher</em>
              </h1>
              <p className="lede">
                Upload a textbook, a paper, or your class notes. Folio reads it, explains it in plain
                language, and quizzes you until it sticks.
              </p>
              <div className="hero-ctas">
                <Link to="/register" className="btn btn-primary">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
              </div>
              <div className="trust-row">
                <div className="stack">
                  <span />
                  <span />
                  <span />
                </div>
                Built for students learning at their own pace
              </div>
            </div>
            <div className="hero-visual">
              <canvas ref={canvasRef} />
              <div className="hero-card-float hero-card-1">
                <span className="dot" style={{ background: 'var(--success-tint)', color: '#067A55' }}>
                  <CheckCircle2 size={18} />
                </span>
                Get your quiz score
              </div>
              <div className="hero-card-float hero-card-2">
                <span className="dot" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
                  <MessageCircle size={18} />
                </span>
                Explaining chapter X
              </div>
            </div>
          </div>
        </section>

        <section id="how">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>From PDF to understanding, in three steps</h2>
            <p>Folio walks every document through the same simple path.</p>
          </div>
          <div className="steps">
            <div className="step-card">
              <div className="step-num">STEP 01</div>
              <div className="step-icon">
                <UploadCloud size={24} />
              </div>
              <h3>Upload your PDF</h3>
              <p>
                Drop in a textbook chapter, lecture slides, or research paper. Any language, any
                length.
              </p>
              <ArrowRight className="step-arrow" size={20} />
            </div>
            <div className="step-card">
              <div className="step-num">STEP 02</div>
              <div className="step-icon">
                <BrainCircuit size={24} />
              </div>
              <h3>AI understands it</h3>
              <p>
                Folio reads the full document and builds a map of its key ideas, terms, and
                structure.
              </p>
              <ArrowRight className="step-arrow" size={20} />
            </div>
            <div className="step-card">
              <div className="step-num">STEP 03</div>
              <div className="step-icon">
                <GraduationCap size={24} />
              </div>
              <h3>Chat & quiz yourself</h3>
              <p>
                Ask questions in plain language, then test what stuck with a quiz built from the
                material.
              </p>
            </div>
          </div>
        </section>

        <section id="features">
          <div className="features">
            <div className="section-head">
              <span className="eyebrow">Features</span>
              <h2>Everything you need to actually learn the material</h2>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}
                >
                  <MessageSquareText size={22} />
                </div>
                <h3>Chat with PDFs</h3>
                <p>Ask questions about any page and get answers grounded in the document.</p>
              </div>
              <div className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: 'var(--warning-tint)', color: '#9A6205' }}
                >
                  <ListChecks size={22} />
                </div>
                <h3>Generate quizzes</h3>
                <p>Turn any chapter into a multiple-choice quiz in seconds.</p>
              </div>
              <div className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: 'var(--success-tint)', color: '#067A55' }}
                >
                  <TrendingUp size={22} />
                </div>
                <h3>Track progress</h3>
                <p>See your scores and reading history build up over time.</p>
              </div>
              <div className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: 'var(--primary-tint-2)', color: 'var(--primary-dark)' }}
                >
                  <Languages size={22} />
                </div>
                <h3>Multiple languages</h3>
                <p>Read and chat in the language you're most comfortable with.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="cta-band">
            <h2>Your next study session starts with one PDF</h2>
            <p>No credit card. No setup. Just upload and start learning.</p>
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <BookOpen size={17} />
            </span>
            Folio
          </Link>
          <div className="footer-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Get Started</Link>
          </div>
          <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>© 2026 Folio</span>
        </div>
      </footer>
    </div>
  )
}
