import type { GameState } from './types'

const STORAGE_KEY = 'rummy-tracker-state'

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as GameState
    if (!Array.isArray(state.players) || !Array.isArray(state.rounds)) return null
    return state
  } catch {
    return null
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (e.g. private mode) - keep app functional in-memory
  }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}
