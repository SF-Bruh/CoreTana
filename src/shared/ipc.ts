/** Shared types for the IPC contract between renderer and main. */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type CoreTanaMode = 'downtime' | 'sparring' | 'intel'

export interface CoreTanaReplyChunk {
  /** Raw text delta as it streams in. */
  delta: string
}

export interface CoreTanaReplyDone {
  /** Full reply text, tags included, once the stream finishes. */
  fullText: string
}

/** Status of the local Ollama runtime — no API keys, no accounts, nothing paid. */
export interface OllamaStatus {
  /** Whether the local Ollama server answered at all. */
  running: boolean
  /** Model names Ollama already has pulled locally. */
  installedModels: string[]
  /** The model CoreTana is currently configured to use, if one was picked. */
  configuredModel: string | null
}

export const IPC = {
  checkOllama: 'coretana:check-ollama',
  setModel: 'coretana:set-model',
  sendMessage: 'coretana:send-message',
  streamChunk: 'coretana:stream-chunk',
  streamDone: 'coretana:stream-done',
  streamError: 'coretana:stream-error'
} as const
