import './VoiceControls.css'

interface VoiceControlsProps {
  supported: boolean
  enabled: boolean
  onToggle: (enabled: boolean) => void
  voices: SpeechSynthesisVoice[]
  voiceURI: string | null
  onVoiceChange: (uri: string) => void
}

export function VoiceControls({
  supported,
  enabled,
  onToggle,
  voices,
  voiceURI,
  onVoiceChange
}: VoiceControlsProps): JSX.Element {
  return (
    <div className="voice-controls">
      <div className="app-section-label">Voice</div>
      {!supported ? (
        <div className="voice-unsupported">No text-to-speech voices found on this system.</div>
      ) : (
        <>
          <button className={`voice-toggle ${enabled ? 'on' : 'off'}`} onClick={() => onToggle(!enabled)}>
            <span className="voice-toggle-track">
              <span className="voice-toggle-thumb" />
            </span>
            {enabled ? 'Voice on' : 'Voice off'}
          </button>
          {enabled && voices.length > 0 && (
            <select value={voiceURI ?? ''} onChange={(e) => onVoiceChange(e.target.value)}>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </div>
  )
}
