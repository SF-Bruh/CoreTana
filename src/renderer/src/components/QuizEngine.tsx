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

export function QuizEngine({ lesson, onSubmitMcq, onSubmitCode, isStreaming, onFinish }: QuizEngineProps): JSX.Element {
  const [index, setIndex] = useState(0)
  const [code, setCode] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

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
  }

  function submitMcq(choiceIndex: number): void {
    if (answered || isStreaming) return
    setAnswered(true)
    onSubmitMcq(question as McqQuestion, choiceIndex)
  }

  function submitCode(): void {
    if (answered || isStreaming || code === null) return
    setAnswered(true)
    onSubmitCode(question.prompt, code)
  }

  return (
    <div className="quiz-engine">
      <div className="quiz-progress">
        Drill {index + 1} / {lesson.questions.length}
      </div>
      <p className="quiz-prompt">{question.prompt}</p>

      {question.type === 'mcq' && (
        <div className="quiz-choices">
          {question.choices.map((choice, i) => (
            <button key={choice} disabled={answered || isStreaming} onClick={() => submitMcq(i)}>
              {choice}
            </button>
          ))}
        </div>
      )}

      {question.type === 'code' && (
        <div className="quiz-code">
          <textarea
            value={code ?? question.starterCode}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            disabled={answered}
          />
          <button className="submit-code" disabled={answered || isStreaming} onClick={submitCode}>
            Submit to CoreTana
          </button>
        </div>
      )}

      {answered && !isStreaming && (
        <button className="quiz-next" onClick={next}>
          {isLast ? 'Finish drill set' : 'Next drill →'}
        </button>
      )}
    </div>
  )
}
