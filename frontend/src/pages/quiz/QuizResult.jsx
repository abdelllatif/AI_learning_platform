import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, RotateCw, Check, X } from 'lucide-react'
import './quiz-result.css'

const RADIUS = 78
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getScoreMeta(pct) {
  if (pct < 50) {
    return { label: 'Needs review', headline: "Let's review this together", color: 'var(--danger)' }
  }
  if (pct < 75) {
    return { label: 'Good effort', headline: 'Good effort — almost there', color: 'var(--warning)' }
  }
  return { label: 'Excellent', headline: 'Excellent work!', color: 'var(--success)' }
}

export default function QuizResult() {
  const ringRef = useRef(null)
  const [scoreData, setScoreData] = useState({
    score: 0,
    total: 0,
    time: '00:00',
    pct: 0,
    quizTitle: 'Quiz',
    attempt: null,
  })
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE)

  useEffect(() => {
    const stored = sessionStorage.getItem('folio_quiz_score')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      setScoreData({
        score: parsed.score ?? 0,
        total: parsed.total ?? 0,
        time: parsed.time ?? '00:00',
        pct: parsed.pct ?? Math.round(((parsed.score ?? 0) / (parsed.total || 1)) * 100),
        quizTitle: parsed.quizTitle || 'Quiz',
        attempt: parsed.attempt || null,
      })
    } catch {
      /* keep fallback */
    }
  }, [])

  const pct =
    scoreData.pct != null
      ? Math.round(Number(scoreData.pct))
      : Math.round((scoreData.score / (scoreData.total || 1)) * 100)
  const meta = getScoreMeta(pct)
  const wrong = Math.max(0, scoreData.total - scoreData.score)

  const reviewItems = useMemo(() => {
    const answers = scoreData.attempt?.answers
    if (!Array.isArray(answers) || !answers.length) return []
    return answers.map(a => ({
      correct: Boolean(a.is_correct),
      question: `Question #${a.question}`,
      answers: [
        {
          type: a.is_correct ? 'right' : 'wrong',
          text: a.is_correct
            ? `Selected answer #${a.selected}`
            : `Your answer #${a.selected ?? 'none'} was incorrect`,
        },
      ],
    }))
  }, [scoreData.attempt])

  useEffect(() => {
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE
    const ring = ringRef.current
    if (!ring) return

    ring.setAttribute('stroke-dasharray', String(CIRCUMFERENCE))
    ring.style.stroke = meta.color

    requestAnimationFrame(() => {
      setTimeout(() => setRingOffset(offset), 150)
    })
  }, [pct, meta.color])

  return (
    <div className="result-shell">
      <div className="card result-card">
        <div className="result-eyebrow">{scoreData.quizTitle} · Quiz complete</div>
        <div className="ring-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle className="ring-bg" cx="90" cy="90" r={RADIUS} fill="none" strokeWidth="14" />
            <circle
              ref={ringRef}
              className="ring-fill"
              cx="90"
              cy="90"
              r={RADIUS}
              fill="none"
              strokeWidth="14"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="ring-center">
            <b>{pct}%</b>
            <span>{meta.label}</span>
          </div>
        </div>
        <div className="result-label">
          <Trophy size={18} style={{ color: 'var(--warning)' }} />
          <span>{meta.headline}</span>
        </div>
        <p className="result-sub">
          You answered {scoreData.score} out of {scoreData.total} questions correctly.
        </p>

        <div className="stat-trio">
          <div className="card">
            <b style={{ color: '#067a55' }}>{scoreData.score}</b>
            <span>Correct</span>
          </div>
          <div className="card">
            <b style={{ color: '#c0392b' }}>{wrong}</b>
            <span>Wrong</span>
          </div>
          <div className="card">
            <b>{scoreData.time}</b>
            <span>Time taken</span>
          </div>
        </div>

        <div className="result-actions">
          {reviewItems.length > 0 && (
            <a href="#review" className="btn btn-ghost">
              Review Answers
            </a>
          )}
          <Link to="/quiz" className="btn btn-primary">
            Back to Quizzes <RotateCw size={15} />
          </Link>
        </div>
      </div>

      {reviewItems.length > 0 && (
        <div className="review-block" id="review">
          <div className="review-head">
            <h2>Review your answers</h2>
            <Link to="/documents" className="btn btn-ghost btn-sm">
              Back to library
            </Link>
          </div>

          {reviewItems.map((item, i) => (
            <div key={i} className="card review-item">
              <div className={`review-icon ${item.correct ? 'correct' : 'wrong'}`}>
                {item.correct ? <Check size={14} /> : <X size={14} />}
              </div>
              <div className="review-body">
                <b>{item.question}</b>
                <div className="review-answers">
                  {item.answers.map((ans, j) => (
                    <span key={j} className={ans.type === 'wrong' ? 'wrong-ans' : 'right-ans'}>
                      {ans.type === 'wrong' ? '✕' : '✓'} {ans.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
