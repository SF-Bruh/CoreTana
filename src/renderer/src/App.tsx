import { useEffect, useRef, useState } from 'react'
import { CoreTanaAvatar, type AvatarForm } from './components/CoreTanaAvatar'
import { ChatDock } from './components/ChatDock'
import { OllamaGate } from './components/OllamaGate'
import { LessonView } from './components/LessonView'
import { QuizEngine } from './components/QuizEngine'
import { VoiceControls } from './components/VoiceControls'
import { useCoretanaChat } from './hooks/useCoretanaChat'
import { useSpeech } from './hooks/useSpeech'
import { LESSONS } from './content/lessons'
import { CURRICULUM } from './content/curriculum'
import type { McqQuestion } from './content/types'
import './styles/App.css'

type View = 'learn' | 'spar'

const lesson = LESSONS['variables-and-data-types']

function App(): JSX.Element {
  const [model, setModel] = useState<string | null>(null)
  const [view, setView] = useState<View>('learn')
  const chat = useCoretanaChat()
  const speech = useSpeech()
  const wasStreamingRef = useRef(false)

  useEffect(() => {
    if (model && chat.history.length === 0) {
      chat.send(
        `We're opening a session on "${lesson.title}". Greet me briefly and tell me what we're about to cover, in your voice.`,
        'downtime'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  useEffect(() => {
    if (wasStreamingRef.current && !chat.isStreaming && !chat.error) {
      speech.speak(chat.displayText)
    }
    wasStreamingRef.current = chat.isStreaming
  }, [chat.isStreaming, chat.error, chat.displayText, speech.speak])

  if (!model) return <OllamaGate onReady={setModel} />

  const form: AvatarForm = view === 'spar' ? 'sparring' : 'orb'

  function handleAsk(question: string): void {
    chat.send(question, 'downtime')
  }

  function handleStartSparring(): void {
    setView('spar')
    chat.send(
      `Start the drill set on "${lesson.title}". I'm ready — put me through the first one.`,
      'sparring'
    )
  }

  function handleMcqSubmit(question: McqQuestion, chosenIndex: number): void {
    const correct = chosenIndex === question.correctIndex
    chat.send(
      `Drill: "${question.prompt}"\nMy answer: "${question.choices[chosenIndex]}"\nCorrect answer: "${question.choices[question.correctIndex]}"\nI got it ${correct ? 'right' : 'wrong'}. Grade me and explain the one thing that matters. Context: ${question.explanation}`,
      'sparring'
    )
  }

  function handleCodeSubmit(prompt: string, code: string): void {
    chat.send(`Drill: "${prompt}"\nMy code:\n\`\`\`apex\n${code}\n\`\`\`\nGrade it.`, 'sparring')
  }

  function handleFinishSparring(): void {
    setView('learn')
    chat.send(`That's the drill set done. Wrap it up — how did I do overall?`, 'downtime')
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">CORETANA</div>
        <nav className="app-nav">
          <button className={view === 'learn' ? 'active' : ''} onClick={() => setView('learn')}>
            Learn
          </button>
          <button className={view === 'spar' ? 'active' : ''} onClick={handleStartSparring}>
            Spar
          </button>
        </nav>
        <VoiceControls
          supported={speech.supported}
          enabled={speech.enabled}
          onToggle={speech.setEnabled}
          voices={speech.voices}
          voiceURI={speech.voiceURI}
          onVoiceChange={speech.setVoiceURI}
        />
        <div className="app-curriculum">
          <div className="app-curriculum-title">Roadmap</div>
          {CURRICULUM.map((entry) => (
            <div key={entry.id} className={`curriculum-entry ${entry.available ? '' : 'locked'}`}>
              {entry.title}
            </div>
          ))}
        </div>
      </aside>

      <main className="app-main">
        <div className="app-avatar-stage">
          <CoreTanaAvatar form={form} mood={chat.mood} posture={chat.posture} speaking={speech.isSpeaking} />
        </div>
        <ChatDock
          speakerLabel="CoreTana"
          text={chat.displayText}
          isStreaming={chat.isStreaming}
          error={chat.error}
        />
      </main>

      <section className="app-content">
        {view === 'learn' ? (
          <LessonView
            lesson={lesson}
            onAsk={handleAsk}
            isStreaming={chat.isStreaming}
            onStartSparring={handleStartSparring}
          />
        ) : (
          <QuizEngine
            lesson={lesson}
            onSubmitMcq={handleMcqSubmit}
            onSubmitCode={handleCodeSubmit}
            isStreaming={chat.isStreaming}
            onFinish={handleFinishSparring}
          />
        )}
      </section>
    </div>
  )
}

export default App
