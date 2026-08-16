import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Text-to-speech via the browser's built-in SpeechSynthesis API — the same
 * free, offline voice engine your OS already has (Windows SAPI, macOS
 * AVSpeechSynthesizer, etc). No account, no download, no cost.
 */

const STORAGE_KEY = 'coretana-voice-uri'

interface UseSpeech {
  supported: boolean
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  voiceURI: string | null
  setVoiceURI: (uri: string) => void
  speak: (text: string) => void
  stop: () => void
}

export function useSpeech(): UseSpeech {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [enabled, setEnabledState] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURIState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
  )
  const voiceURIRef = useRef(voiceURI)
  voiceURIRef.current = voiceURI

  useEffect(() => {
    if (!supported) return

    function loadVoices(): void {
      const list = window.speechSynthesis.getVoices()
      if (list.length === 0) return
      setVoices(list)
      if (!voiceURIRef.current) {
        const preferred =
          list.find((v) => v.lang.startsWith('en') && /female|zira|samantha|aria/i.test(v.name)) ??
          list.find((v) => v.lang.startsWith('en')) ??
          list[0]
        if (preferred) setVoiceURIState(preferred.voiceURI)
      }
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [supported])

  const setVoiceURI = useCallback((uri: string) => {
    setVoiceURIState(uri)
    window.localStorage.setItem(STORAGE_KEY, uri)
  }, [])

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    if (!next) window.speechSynthesis.cancel()
  }, [])

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled || !text.trim()) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = voices.find((v) => v.voiceURI === voiceURI)
      if (voice) utterance.voice = voice
      utterance.rate = 1
      utterance.pitch = 1.05

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [supported, enabled, voices, voiceURI]
  )

  return { supported, enabled, setEnabled, isSpeaking, voices, voiceURI, setVoiceURI, speak, stop }
}
