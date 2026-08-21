import { type FormEvent, useState } from 'react'
import type { Lesson } from '../content/types'
import { highlightApex } from '../utils/highlightApex'
import './LessonView.css'

interface LessonViewProps {
  lesson: Lesson
  onAsk: (question: string) => void
  isStreaming: boolean
  onStartSparring: () => void
}

export function LessonView({ lesson, onAsk, isStreaming, onStartSparring }: LessonViewProps): JSX.Element {
  const [question, setQuestion] = useState('')

  function handleAsk(e: FormEvent): void {
    e.preventDefault()
    if (!question.trim() || isStreaming) return
    onAsk(question.trim())
    setQuestion('')
  }

  return (
    <div className="lesson-view">
      <div className="lesson-kicker">Beginner · Lesson 1</div>
      <h1>{lesson.title}</h1>

      {lesson.sections.map((section, i) => (
        <section key={section.heading} className="lesson-section">
          <div className="lesson-section-index">{String(i + 1).padStart(2, '0')}</div>
          <div className="lesson-section-body">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.code && (
              <div className="code-block">
                <div className="code-block-bar">
                  <span className="code-dot" />
                  <span className="code-dot" />
                  <span className="code-dot" />
                  <span className="code-lang">apex</span>
                </div>
                <pre className="code-block-body">
                  <code>{highlightApex(section.code)}</code>
                </pre>
              </div>
            )}
          </div>
        </section>
      ))}

      <form className="lesson-ask" onSubmit={handleAsk}>
        <input
          placeholder="Ask CoreTana about this…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !question.trim()}>
          Ask
        </button>
      </form>

      <button className="start-sparring" onClick={onStartSparring}>
        Spar with CoreTana on this
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
