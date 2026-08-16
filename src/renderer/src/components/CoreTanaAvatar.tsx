import { useMemo } from 'react'
import type { MoodTag, PostureTag } from '@shared/renderTags'
import './CoreTanaAvatar.css'

export type AvatarForm = 'orb' | 'sparring'

interface CoreTanaAvatarProps {
  form: AvatarForm
  mood: MoodTag | null
  posture: PostureTag | null
  speaking?: boolean
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

// Hourglass silhouette, built once and reused for both the visible body
// and the clip path the code-rain overlay is confined to.
const HAIR_D =
  'M78 42 C78 22 88 6 100 6 C112 6 122 22 122 42 C122 46 121 50 119 53 C121 47 121 40 118 30 C115 18 108 12 100 12 C92 12 85 18 82 30 C79 40 79 47 81 53 C79 50 78 46 78 42 Z'

const TORSO_D =
  'M85 76 C75 84 62 92 58 100 C56 122 64 140 80 153 C68 163 56 180 54 210 C53 222 60 233 70 238 L130 238 C140 233 147 222 146 210 C144 180 132 163 120 153 C136 140 144 122 142 100 C138 92 125 84 115 76 Z'

const ARM_LEFT_D =
  'M85 78 C60 86 32 90 32 100 C32 135 32 170 32 202 C32 212 42 218 50 216 C50 212 50 170 50 135 C50 100 50 88 85 78 Z'

const ARM_RIGHT_D =
  'M115 78 C140 86 168 90 168 100 C168 135 168 170 168 202 C168 212 158 218 150 216 C150 212 150 170 150 135 C150 100 150 88 115 78 Z'

const LEG_LEFT_D = 'M70 238 C66 262 65 288 70 308 C72 318 82 322 92 316 C90 296 92 268 96 240 Z'
const LEG_RIGHT_D = 'M130 238 C134 262 135 288 130 308 C128 318 118 322 108 316 C110 296 108 268 104 240 Z'

export function CoreTanaAvatar({ form, mood, posture, speaking }: CoreTanaAvatarProps): JSX.Element {
  const className = useMemo(() => {
    const classes = ['coretana-avatar', `form-${form}`]
    if (mood) classes.push(MOOD_CLASS[mood])
    if (posture) classes.push(POSTURE_CLASS[posture])
    if (speaking) classes.push('is-speaking')
    return classes.join(' ')
  }, [form, mood, posture, speaking])

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
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="faceGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="figureSkinClip">
              <circle cx="100" cy="44" r="23" />
              <path d={TORSO_D} />
              <path d={ARM_LEFT_D} />
              <path d={ARM_RIGHT_D} />
              <path d={LEG_LEFT_D} />
              <path d={LEG_RIGHT_D} />
            </clipPath>
            <pattern id="codeRainTile" width="18" height="40" patternUnits="userSpaceOnUse">
              <line className="rain-glyph" x1="4" y1="2" x2="4" y2="11" />
              <line className="rain-glyph" x1="12" y1="15" x2="12" y2="21" style={{ animationDelay: '-0.5s' }} />
              <line className="rain-glyph" x1="6" y1="25" x2="6" y2="32" style={{ animationDelay: '-1.1s' }} />
              <line className="rain-glyph" x1="14" y1="34" x2="14" y2="39" style={{ animationDelay: '-1.6s' }} />
            </pattern>
          </defs>

          <g className="figure-glow" filter="url(#figureGlow)" fill="url(#figureFill)">
            <path className="figure-torso" d={TORSO_D} />
            <path className="figure-arm-left" d={ARM_LEFT_D} />
            <path className="figure-arm-right" d={ARM_RIGHT_D} />
            <path className="figure-leg-left" d={LEG_LEFT_D} />
            <path className="figure-leg-right" d={LEG_RIGHT_D} />
            <circle className="figure-head" cx="100" cy="44" r="23" />
          </g>

          <path className="figure-hair" d={HAIR_D} fill="url(#figureFill)" filter="url(#figureGlow)" />

          <g clipPath="url(#figureSkinClip)">
            <rect className="rain-rect" x="0" y="0" width="200" height="340" fill="url(#codeRainTile)" />
          </g>

          <g className="figure-face" filter="url(#faceGlow)">
            <ellipse className="figure-eye" cx="91" cy="46" rx="3" ry="2.4" />
            <ellipse className="figure-eye" cx="109" cy="46" rx="3" ry="2.4" />
            <path className="figure-mouth" d="M92 60 Q100 64 108 60" />
          </g>
        </svg>

        <div className="transition-burst" />
      </div>
    </div>
  )
}
