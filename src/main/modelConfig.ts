import { app } from 'electron'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Which local Ollama model CoreTana talks to. Not a secret — just a
 * preference — so it's stored as plain JSON, unlike the old API key.
 */

function configPath(): string {
  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'coretana-model.json')
}

export function getConfiguredModel(): string | null {
  const path = configPath()
  if (!existsSync(path)) return null
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'))
    return typeof data.model === 'string' ? data.model : null
  } catch {
    return null
  }
}

export function setConfiguredModel(model: string): void {
  writeFileSync(configPath(), JSON.stringify({ model: model.trim() }))
}
