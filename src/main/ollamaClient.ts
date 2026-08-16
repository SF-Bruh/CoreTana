import { buildSystemPrompt } from './persona'
import { getConfiguredModel } from './modelConfig'
import type { ChatMessage, CoreTanaMode } from '../shared/ipc'

/**
 * CoreTana runs entirely on your machine via Ollama (https://ollama.com) —
 * no API key, no account, no per-message cost. This just talks to Ollama's
 * local HTTP server, which only ever listens on localhost.
 */
const OLLAMA_BASE = 'http://127.0.0.1:11434'

export class MissingModelError extends Error {
  constructor() {
    super('No local model picked yet.')
    this.name = 'MissingModelError'
  }
}

interface OllamaTagsResponse {
  models?: Array<{ name: string }>
}

export async function checkOllama(): Promise<{ running: boolean; installedModels: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`)
    if (!res.ok) return { running: false, installedModels: [] }
    const data = (await res.json()) as OllamaTagsResponse
    const installedModels = Array.isArray(data.models) ? data.models.map((m) => m.name) : []
    return { running: true, installedModels }
  } catch {
    return { running: false, installedModels: [] }
  }
}

export async function streamCoreTanaReply(
  history: ChatMessage[],
  mode: CoreTanaMode,
  onDelta: (text: string) => void
): Promise<string> {
  const model = getConfiguredModel()
  if (!model) throw new MissingModelError()

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: 'system', content: buildSystemPrompt(mode) }, ...history],
      options: { num_predict: mode === 'sparring' ? 400 : 1200 }
    })
  })

  if (!res.ok || !res.body) {
    throw new Error(`Ollama couldn't run "${model}" (HTTP ${res.status}). Make sure it's pulled: ollama pull ${model}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      const parsed = JSON.parse(line) as { message?: { content?: string } }
      const delta = parsed.message?.content
      if (delta) {
        full += delta
        onDelta(delta)
      }
    }
  }

  return full
}
