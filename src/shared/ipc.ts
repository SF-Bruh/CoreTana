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

export interface ApiKeyStatus {
  hasKey: boolean
}

export const IPC = {
  getApiKeyStatus: 'coretana:get-api-key-status',
  setApiKey: 'coretana:set-api-key',
  clearApiKey: 'coretana:clear-api-key',
  sendMessage: 'coretana:send-message',
  streamChunk: 'coretana:stream-chunk',
  streamDone: 'coretana:stream-done',
  streamError: 'coretana:stream-error'
} as const
