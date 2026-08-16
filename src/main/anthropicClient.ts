import Anthropic from '@anthropic-ai/sdk'
import { loadApiKey } from './apiKeyStore'
import { buildSystemPrompt } from './persona'
import type { ChatMessage, CoreTanaMode } from '../shared/ipc'

const MODEL = 'claude-sonnet-5'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Anthropic API key configured yet.')
    this.name = 'MissingApiKeyError'
  }
}

export async function streamCoreTanaReply(
  history: ChatMessage[],
  mode: CoreTanaMode,
  onDelta: (text: string) => void
): Promise<string> {
  const apiKey = loadApiKey()
  if (!apiKey) throw new MissingApiKeyError()

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: mode === 'sparring' ? 400 : 1200,
    system: buildSystemPrompt(mode),
    messages: history.map((m) => ({ role: m.role, content: m.content }))
  })

  let full = ''
  stream.on('text', (delta) => {
    full += delta
    onDelta(delta)
  })

  await stream.finalMessage()
  return full
}
