import { useMemo } from 'react'
import type { MoodTag, PostureTag } from '@shared/renderTags'
import { CoreTanaFigure3D } from './CoreTanaFigure3D'
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

        <div className="figure-layer">
          {form === 'sparring' && (
            <CoreTanaFigure3D mood={mood} posture={posture} speaking={Boolean(speaking)} />
          )}
        </div>

        <div className="transition-burst" />
      </div>
    </div>
  )
}
