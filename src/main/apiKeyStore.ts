import { app, safeStorage } from 'electron'
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'

/**
 * The Anthropic API key never leaves this machine and never touches the
 * renderer process. It's encrypted at rest with the OS keychain (via
 * Electron's safeStorage) so it isn't sitting around as plain text on disk.
 */

function configPath(): string {
  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'coretana.key')
}

export function hasApiKey(): boolean {
  return existsSync(configPath())
}

export function saveApiKey(key: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS-level encryption is unavailable on this system; refusing to store the key.')
  }
  const encrypted = safeStorage.encryptString(key.trim())
  writeFileSync(configPath(), encrypted)
}

export function loadApiKey(): string | null {
  const path = configPath()
  if (!existsSync(path)) return null
  const encrypted = readFileSync(path)
  return safeStorage.decryptString(encrypted)
}

export function clearApiKey(): void {
  const path = configPath()
  if (existsSync(path)) unlinkSync(path)
}
