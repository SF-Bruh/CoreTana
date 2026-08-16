import { useState, type FormEvent } from 'react'
import './ApiKeyGate.css'

interface ApiKeyGateProps {
  onSaved: () => void
}

export function ApiKeyGate({ onSaved }: ApiKeyGateProps): JSX.Element {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!key.trim()) return
    setBusy(true)
    setError(null)
    try {
      await window.coretana.setApiKey(key.trim())
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="api-key-gate">
      <div className="api-key-card">
        <h1>CoreTana needs a key to wake up.</h1>
        <p>
          Paste your own Anthropic API key. It's encrypted with your OS keychain and stored only on
          this machine in your local user data folder — it is never sent anywhere except directly to
          Anthropic's API when CoreTana replies, and it never leaves this app.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={busy || !key.trim()}>
            {busy ? 'Saving…' : 'Wake her up'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="hint">
          Don't have a key yet? Create one at console.anthropic.com — you're billed only for what you
          use.
        </p>
      </div>
    </div>
  )
}
