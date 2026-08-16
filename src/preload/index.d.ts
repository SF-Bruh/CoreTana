import type { CoretanaApi } from './index'

declare global {
  interface Window {
    coretana: CoretanaApi
  }
}
