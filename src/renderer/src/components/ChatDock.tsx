import './ChatDock.css'

interface ChatDockProps {
  speakerLabel: string
  text: string
  isStreaming: boolean
  error: string | null
}

export function ChatDock({ speakerLabel, text, isStreaming, error }: ChatDockProps): JSX.Element {
  return (
    <div className="chat-dock">
      <div className="chat-dock-label">{speakerLabel}</div>
      <div className="chat-dock-text">
        {error ? (
          <span className="chat-dock-error">Connection dropped: {error}</span>
        ) : (
          <>
            {text || (isStreaming ? '…' : '')}
            {isStreaming && <span className="chat-dock-cursor" />}
          </>
        )}
      </div>
    </div>
  )
}
