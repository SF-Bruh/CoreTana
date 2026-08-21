import { useState } from 'react'
import type { Lesson, McqQuestion } from '../content/types'
import './QuizEngine.css'

interface QuizEngineProps {
  lesson: Lesson
  onSubmitMcq: (question: McqQuestion, chosenIndex: number) => void
  onSubmitCode: (prompt: string, code: string) => void
  isStreaming: boolean
  onFinish: () => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function QuizEngine({ lesson, onSubmitMcq, onSubmitCode, isStreaming, onFinish }: QuizEngineProps): JSX.Element {
  const [index, setIndex] = useState(0)
  const [code, setCode] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)

  const question = lesson.questions[index]
  const isLast = index === lesson.questions.length - 1

  function next(): void {
    if (isLast) {
      onFinish()
      return
    }
    setIndex((i) => i + 1)
    setCode(null)
    setAnswered(false)
    setChosenIndex(null)
  }

  function submitMcq(choiceIndex: number): void {
    if (answered || isStreaming) return
    setAnswered(true)
    setChosenIndex(choiceIndex)
    onSubmitMcq(question as McqQuestion, choiceIndex)
  }

  function submitCode(): void {
    if (answered || isStreaming || code === null) return
    setAnswered(true)
    onSubmitCode(question.prompt, code)
  }

  return (
    <div className="quiz-engine">
      <div className="quiz-progress-row">
        <span className="quiz-progress-label">
          Drill {index + 1} / {lesson.questions.length}
        </span>
        <div className="quiz-progress-bar">
          {lesson.questions.map((q, i) => (
            <span key={q.id} className={`quiz-progress-seg ${i < index ? 'done' : ''} ${i === index ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <p className="quiz-prompt">{question.prompt}</p>

      {question.type === 'mcq' && (
        <div className="quiz-choices">
          {question.choices.map((choice, i) => {
            const isChosen = chosenIndex === i
            const isCorrect = i === question.correctIndex
            const showResult = answered && (isChosen || isCorrect)
            const resultClass = showResult ? (isCorrect ? 'correct' : 'wrong') : ''
            return (
              <button
                key={choice}
                className={resultClass}
                disabled={answered || isStreaming}
                onClick={() => submitMcq(i)}
              >
                <span className="quiz-choice-letter">{LETTERS[i]}</span>
                {choice}
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'code' && (
        <div className="code-block quiz-code">
          <div className="code-block-bar">
            <span className="code-dot" />
            <span className="code-dot" />
            <span className="code-dot" />
            <span className="code-lang">apex</span>
          </div>
          <textarea
            value={code ?? question.starterCode}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            disabled={answered}
          />
        </div>
      )}
      {question.type === 'code' && (
        <button className="submit-code" disabled={answered || isStreaming} onClick={submitCode}>
          Submit to CoreTana
        </button>
      )}

      {answered && !isStreaming && (
        <button className="quiz-next" onClick={next}>
          {isLast ? 'Finish drill set' : 'Next drill'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
