import { useCallback, useEffect, useState } from 'react'
import './OllamaGate.css'

interface OllamaGateProps {
  onReady: (model: string) => void
}

const RECOMMENDED_MODEL = 'qwen2.5-coder:7b'
const LIGHT_MODEL = 'llama3.2'

type Phase = 'checking' | 'not-running' | 'no-models' | 'pick-model'

export function OllamaGate({ onReady }: OllamaGateProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('checking')
  const [installedModels, setInstalledModels] = useState<string[]>([])
  const [customModel, setCustomModel] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setPhase('checking')
    const status = await window.coretana.checkOllama()
    if (!status.running) {
      setPhase('not-running')
      return
    }
    if (status.configuredModel) {
      onReady(status.configuredModel)
      return
    }
    setInstalledModels(status.installedModels)
    setPhase(status.installedModels.length === 0 ? 'no-models' : 'pick-model')
  }, [onReady])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function pick(model: string): Promise<void> {
    setBusy(true)
    const result = await window.coretana.setModel(model)
    setBusy(false)
    onReady(result.configuredModel)
  }

  return (
    <div className="ollama-gate">
      <div className="ollama-card">
        <h1>CoreTana needs a local model to think with.</h1>
        <p className="ollama-sub">
          No API key, no account, no cost — she runs entirely on your machine through{' '}
          <strong>Ollama</strong>, a free local model runner.
        </p>

        {phase === 'checking' && <p className="ollama-status">Checking for Ollama…</p>}

        {phase === 'not-running' && (
          <>
            <ol className="ollama-steps">
              <li>
                Install Ollama from <span className="ollama-code">ollama.com/download</span> (free).
              </li>
              <li>Ollama runs as a background service once installed — no need to keep a terminal open.</li>
            </ol>
            <button disabled={busy} onClick={() => void refresh()}>
              Check again
            </button>
          </>
        )}

        {phase === 'no-models' && (
          <>
            <p>Ollama's running, but you don't have a model pulled yet. In a terminal:</p>
            <pre className="ollama-code-block">ollama pull {RECOMMENDED_MODEL}</pre>
            <p className="ollama-hint">
              That's a solid, code-aware model (~5GB, one-time download). If your machine is limited on
              RAM, <span className="ollama-code">ollama pull {LIGHT_MODEL}</span> is a lighter fallback.
            </p>
            <button disabled={busy} onClick={() => void refresh()}>
              Check again
            </button>
          </>
        )}

        {phase === 'pick-model' && (
          <>
            <p>Which model should she use?</p>
            <div className="ollama-model-list">
              {installedModels.map((m) => (
                <button key={m} disabled={busy} onClick={() => void pick(m)}>
                  {m}
                </button>
              ))}
            </div>
            <div className="ollama-custom">
              <input
                placeholder="or type another model name…"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
              <button disabled={busy || !customModel.trim()} onClick={() => void pick(customModel.trim())}>
                Use it
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
