import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { X, Timer, ArrowRight, Flag, ListChecks } from 'lucide-react'
import { quizApi } from '../../api'
import './quiz.css'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState({})
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState(id ? 'take' : 'list')

  useEffect(() => {
    document.title = 'Quizzes — Folio'
  }, [])

  useEffect(() => {
    if (mode !== 'take') return undefined
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [mode])

  const formatTime = useCallback(() => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }, [seconds])

  const loadList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await quizApi.list({ ordering: '-created_at' })
      const results = Array.isArray(data) ? data : data?.results || []
      setQuizzes(results)
    } catch (err) {
      setError(err.message || 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadQuiz = useCallback(async quizId => {
    setLoading(true)
    setError('')
    setMode('take')
    try {
      const data = await quizApi.get(quizId)
      setQuiz(data)
      setCurrent(0)
      setSelected({})
      setSeconds(0)
      document.title = `${data.title} — Quiz — Folio`
    } catch (err) {
      setError(err.message || 'Quiz not found')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) loadQuiz(id)
    else {
      setMode('list')
      setQuiz(null)
      loadList()
    }
  }, [id, loadQuiz, loadList])

  const questions = useMemo(() => {
    const qs = quiz?.questions || []
    return [...qs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [quiz])

  const item = questions[current]
  const isLast = current === questions.length - 1
  const chosenId = item ? selected[item.id] : null
  const answeredCount = Object.keys(selected).length

  const selectChoice = answerId => {
    if (!item || selected[item.id] != null) return
    setSelected(prev => ({ ...prev, [item.id]: answerId }))
  }

  const getChoiceClass = answer => {
    if (chosenId == null) return 'choice'
    const classes = ['choice']
    if (answer.is_correct) classes.push('correct')
    else if (answer.id === chosenId) classes.push('wrong')
    return classes.join(' ')
  }

  const handleNext = async () => {
    if (chosenId == null) return

    if (!isLast) {
      setCurrent(c => c + 1)
      return
    }

    setSubmitting(true)
    try {
      const answersPayload = {}
      Object.entries(selected).forEach(([qid, aid]) => {
        answersPayload[String(qid)] = aid
      })
      const attempt = await quizApi.submit(quiz.id, answersPayload)
      const total = questions.length
      const correct = Math.round((Number(attempt.score) / 100) * total)
      sessionStorage.setItem(
        'folio_quiz_score',
        JSON.stringify({
          score: correct,
          total,
          time: formatTime(),
          pct: attempt.score,
          attempt,
          quizTitle: quiz.title,
        })
      )
      navigate('/quiz/result')
    } catch (err) {
      window.alert(err.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (mode === 'list') {
    return (
      <div style={{ padding: '8px 0 40px' }}>
        <div className="lib-head" style={{ marginBottom: 24 }}>
          <div>
            <h1>Quizzes</h1>
            <p>Pick a quiz to practice, or create one via the API / admin for now.</p>
          </div>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        {loading && <p style={{ color: 'var(--text-faint)' }}>Loading quizzes…</p>}
        {!loading && quizzes.length === 0 && (
          <div className="card" style={{ padding: 24 }}>
            <ListChecks size={22} style={{ color: 'var(--primary)', marginBottom: 10 }} />
            <h2 style={{ marginBottom: 8 }}>No quizzes yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Create a quiz with <code>POST /api/quiz/</code> (see Postman), then it will show up
              here.
            </p>
            <Link to="/documents" className="btn btn-soft">
              Back to library
            </Link>
          </div>
        )}
        <div className="quiz-grid" style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
          {quizzes.map(q => (
            <Link key={q.id} to={`/quiz/${q.id}`} className="card" style={{ padding: 18, textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ marginBottom: 6 }}>{q.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                {(q.questions || []).length} questions
                {q.description ? ` · ${q.description}` : ''}
              </p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <p style={{ padding: 24, color: 'var(--text-faint)' }}>Loading quiz…</p>
  }

  if (error || !quiz || !item) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'var(--danger)' }}>{error || 'Quiz has no questions'}</p>
        <Link to="/quiz" className="btn btn-soft">
          Back to quizzes
        </Link>
      </div>
    )
  }

  const progressWidth = ((current / questions.length) * 100) + 100 / questions.length
  const answers = item.answers || []

  return (
    <div className="quiz-shell">
      <div className="quiz-topbar">
        <Link to="/quiz" className="quiz-exit">
          <X size={16} /> Exit quiz
        </Link>
        <div className="quiz-timer">
          <Timer size={14} /> <span>{formatTime()}</span>
        </div>
      </div>

      <div className="quiz-progress-row">
        <span>
          Question {current + 1}/{questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
      </div>

      <div className="card q-card">
        <div className="q-eyebrow">{quiz.title}</div>
        <div className="q-text">{item.text}</div>
        <div className="choices">
          {answers.map((answer, i) => (
            <button
              key={answer.id}
              type="button"
              className={getChoiceClass(answer)}
              disabled={chosenId != null}
              onClick={() => selectChoice(answer.id)}
            >
              <span className="letter">{String.fromCharCode(65 + i)}</span>
              <span>{answer.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button
          type="button"
          className="btn btn-primary"
          disabled={chosenId == null || submitting}
          onClick={handleNext}
        >
          {isLast ? (
            <>
              {submitting ? 'Submitting…' : 'See Results'} <Flag size={16} />
            </>
          ) : (
            <>
              Next Question <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <div className="dots-row">
        {questions.map((q, i) => {
          let cls = 'dot'
          if (i === current) cls += ' current'
          else if (selected[q.id] != null) cls += ' answered'
          return <span key={q.id} className={cls} />
        })}
      </div>
    </div>
  )
}
