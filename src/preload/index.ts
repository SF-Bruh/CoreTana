import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type ChatMessage, type ApiKeyStatus, type CoreTanaMode } from '../shared/ipc'

/**
 * The only surface the renderer ever gets. No Node access, no raw
 * ipcRenderer, no filesystem — just these specific, typed calls.
 */
const coretanaApi = {
  getApiKeyStatus: (): Promise<ApiKeyStatus> => ipcRenderer.invoke(IPC.getApiKeyStatus),
  setApiKey: (key: string): Promise<ApiKeyStatus> => ipcRenderer.invoke(IPC.setApiKey, key),
  clearApiKey: (): Promise<ApiKeyStatus> => ipcRenderer.invoke(IPC.clearApiKey),

  sendMessage: (history: ChatMessage[], mode: CoreTanaMode): Promise<{ ok: boolean; message?: string }> =>
    ipcRenderer.invoke(IPC.sendMessage, { history, mode }),

  onStreamChunk: (cb: (delta: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: { delta: string }): void => cb(payload.delta)
    ipcRenderer.on(IPC.streamChunk, listener)
    return () => ipcRenderer.removeListener(IPC.streamChunk, listener)
  },
  onStreamDone: (cb: (fullText: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: { fullText: string }): void => cb(payload.fullText)
    ipcRenderer.on(IPC.streamDone, listener)
    return () => ipcRenderer.removeListener(IPC.streamDone, listener)
  },
  onStreamError: (cb: (message: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: { message: string }): void => cb(payload.message)
    ipcRenderer.on(IPC.streamError, listener)
    return () => ipcRenderer.removeListener(IPC.streamError, listener)
  }
}

contextBridge.exposeInMainWorld('coretana', coretanaApi)

export type CoretanaApi = typeof coretanaApi
