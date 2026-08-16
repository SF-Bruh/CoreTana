import { useMemo } from 'react'
import type { MoodTag, PostureTag } from '@shared/renderTags'
import './CoreTanaAvatar.css'

export type AvatarForm = 'orb' | 'sparring'

interface CoreTanaAvatarProps {
  form: AvatarForm
  mood: MoodTag | null
  posture: PostureTag | null
}

const MOOD_CLASS: Record<MoodTag, string> = {
  calm: 'mood-calm',
  amused: 'mood-amused',
  urgent: 'mood-urgent',
  strain: 'mood-strain'
}

const POSTURE_CLASS: Record<PostureTag, string> = {
  'lean-in': 'posture-lean-in',
  'pull-back': 'posture-pull-back',
  fragment: 'posture-fragment'
}

export function CoreTanaAvatar({ form, mood, posture }: CoreTanaAvatarProps): JSX.Element {
  const className = useMemo(() => {
    const classes = ['coretana-avatar', `form-${form}`]
    if (mood) classes.push(MOOD_CLASS[mood])
    if (posture) classes.push(POSTURE_CLASS[posture])
    return classes.join(' ')
  }, [form, mood, posture])

  return (
    <div className={className} aria-hidden="true">
      <div className="stage">
        <div className="orb-layer">
          <div className="orb-halo" />
          <div className="orb-core" />
          <div className="orb-ring ring-1" />
          <div className="orb-ring ring-2" />
          <div className="orb-spark" />
        </div>

        <svg className="figure-layer" viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="figureFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--coretana-glow-bright)" />
              <stop offset="60%" stopColor="var(--coretana-glow-mid)" />
              <stop offset="100%" stopColor="var(--coretana-glow-dim)" />
            </linearGradient>
            <filter id="figureGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="figure-glow" filter="url(#figureGlow)" fill="url(#figureFill)">
            <circle className="figure-head" cx="100" cy="46" r="26" />
            <path
              className="figure-torso"
              d="M64 84 C64 78 74 72 100 72 C126 72 136 78 136 84
                 L146 168 C146 176 138 182 128 184
                 L118 240 L82 240 L72 184
                 C62 182 54 176 54 168 Z"
            />
            <path className="figure-arm-left" d="M64 90 C48 100 38 130 40 168 C41 178 48 182 54 178 C52 148 58 116 70 96 Z" />
            <path className="figure-arm-right" d="M136 90 C152 100 162 130 160 168 C159 178 152 182 146 178 C148 148 142 116 130 96 Z" />
            <path className="figure-leg-left" d="M82 240 L76 320 C76 328 84 332 92 328 L96 244 Z" />
            <path className="figure-leg-right" d="M118 240 L124 320 C124 328 116 332 108 328 L104 244 Z" />
          </g>

          <g className="figure-scanlines">
            <line x1="20" y1="60" x2="180" y2="60" />
            <line x1="20" y1="140" x2="180" y2="140" />
            <line x1="20" y1="220" x2="180" y2="220" />
            <line x1="20" y1="300" x2="180" y2="300" />
          </g>
        </svg>

        <div className="transition-burst" />
      </div>
    </div>
  )
}
