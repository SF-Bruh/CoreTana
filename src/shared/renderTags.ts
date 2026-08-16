/**
 * The render-tag vocabulary CoreTana's replies are written in.
 * Main process leaves them inline in the text; the renderer strips them
 * out for display and uses them to drive the avatar's visual state.
 */

export const MOOD_TAGS = ['calm', 'amused', 'urgent', 'strain'] as const
export type MoodTag = (typeof MOOD_TAGS)[number]

export const POSTURE_TAGS = ['lean-in', 'pull-back', 'fragment'] as const
export type PostureTag = (typeof POSTURE_TAGS)[number]

export const ALL_TAGS = [...MOOD_TAGS, ...POSTURE_TAGS] as const
export type RenderTag = MoodTag | PostureTag

const TAG_PATTERN = /\[(calm|amused|urgent|strain|lean-in|pull-back|fragment)\]/gi

export interface ParsedReply {
  /** Display text with render tags removed. */
  text: string
  /** Tags in the order they appeared. */
  tags: RenderTag[]
  /** Most recent mood tag seen, if any — this is what the avatar should reflect. */
  mood: MoodTag | null
  /** Most recent posture tag seen, if any. */
  posture: PostureTag | null
}

export function parseRenderTags(raw: string): ParsedReply {
  const tags: RenderTag[] = []
  let mood: MoodTag | null = null
  let posture: PostureTag | null = null

  for (const match of raw.matchAll(TAG_PATTERN)) {
    const tag = match[1].toLowerCase() as RenderTag
    tags.push(tag)
    if ((MOOD_TAGS as readonly string[]).includes(tag)) mood = tag as MoodTag
    else posture = tag as PostureTag
  }

  const text = raw.replace(TAG_PATTERN, '').replace(/[ \t]{2,}/g, ' ').trim()

  return { text, tags, mood, posture }
}
