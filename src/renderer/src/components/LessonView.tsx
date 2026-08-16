import { type FormEvent, useState } from 'react'
import type { Lesson } from '../content/types'
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
      <h1>{lesson.title}</h1>
      {lesson.sections.map((section) => (
        <section key={section.heading} className="lesson-section">
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
          {section.code && <pre className="lesson-code">{section.code}</pre>}
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
        Spar with CoreTana on this →
      </button>
    </div>
  )
}
