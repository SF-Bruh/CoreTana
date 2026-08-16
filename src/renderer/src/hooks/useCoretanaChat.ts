import { useCallback, useEffect, useRef, useState } from 'react'
import { parseRenderTags, type MoodTag, type PostureTag } from '@shared/renderTags'
import type { ChatMessage, CoreTanaMode } from '@shared/ipc'

interface UseCoretanaChat {
  history: ChatMessage[]
  displayText: string
  isStreaming: boolean
  mood: MoodTag | null
  posture: PostureTag | null
  error: string | null
  send: (userText: string, mode: CoreTanaMode) => void
  reset: () => void
}

export function useCoretanaChat(): UseCoretanaChat {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [displayText, setDisplayText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [mood, setMood] = useState<MoodTag | null>(null)
  const [posture, setPosture] = useState<PostureTag | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bufferRef = useRef('')
  const historyRef = useRef<ChatMessage[]>([])

  useEffect(() => {
    const offChunk = window.coretana.onStreamChunk((delta) => {
      bufferRef.current += delta
      const parsed = parseRenderTags(bufferRef.current)
      setDisplayText(parsed.text)
      if (parsed.mood) setMood(parsed.mood)
      if (parsed.posture) setPosture(parsed.posture)
    })

    const offDone = window.coretana.onStreamDone((fullText) => {
      historyRef.current = [...historyRef.current, { role: 'assistant', content: fullText }]
      setHistory(historyRef.current)
      setIsStreaming(false)
      bufferRef.current = ''
    })

    const offError = window.coretana.onStreamError((message) => {
      setError(message)
      setIsStreaming(false)
      bufferRef.current = ''
    })

    return () => {
      offChunk()
      offDone()
      offError()
    }
  }, [])

  const send = useCallback((userText: string, mode: CoreTanaMode) => {
    const nextHistory: ChatMessage[] = [...historyRef.current, { role: 'user', content: userText }]
    historyRef.current = nextHistory
    setHistory(nextHistory)
    setError(null)
    setDisplayText('')
    bufferRef.current = ''
    setIsStreaming(true)
    void window.coretana.sendMessage(nextHistory, mode)
  }, [])

  const reset = useCallback(() => {
    historyRef.current = []
    setHistory([])
    setDisplayText('')
    setMood(null)
    setPosture(null)
    setError(null)
  }, [])

  return { history, displayText, isStreaming, mood, posture, error, send, reset }
}
