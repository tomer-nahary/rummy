import { useEffect, useState } from 'react'
import type { GameState, Player } from './types'
import { loadState, saveState } from './storage'
import PlayersSetup from './components/PlayersSetup'
import GameScreen from './components/GameScreen'
import Settlement from './components/Settlement'

type View = 'setup' | 'game' | 'settlement'

const emptyState: GameState = { players: [], rounds: [], finished: false }

function App() {
  const [state, setState] = useState<GameState>(() => loadState() ?? emptyState)
  const [view, setView] = useState<View>(() => {
    const saved = loadState()
    if (saved && saved.players.length >= 2) return saved.finished ? 'settlement' : 'game'
    return 'setup'
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  function updateState(updater: (prev: GameState) => GameState) {
    setState((prev) => updater(prev))
  }

  function startGame() {
    updateState((prev) => ({ ...prev, finished: false }))
    setView('game')
  }

  function finishGame() {
    updateState((prev) => ({ ...prev, finished: true }))
    setView('settlement')
  }

  function newGame() {
    if (!window.confirm('להתחיל משחק חדש? כל הנתונים של המשחק הנוכחי יימחקו.')) return
    setState((prev) => ({ ...prev, rounds: [], finished: false }))
    setView('setup')
  }

  function setPlayers(players: Player[]) {
    updateState((prev) => ({ ...prev, players }))
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>מעקב רמי</h1>
        <p className="subtitle">ניקוד ותשלומים למשחק רמי</p>
      </header>
      {view === 'setup' && (
        <PlayersSetup players={state.players} onChange={setPlayers} onStartGame={startGame} />
      )}
      {view === 'game' && (
        <GameScreen state={state} onUpdateState={updateState} onFinishGame={finishGame} />
      )}
      {view === 'settlement' && (
        <Settlement state={state} onReturnToGame={startGame} onNewGame={newGame} />
      )}
    </main>
  )
}

export default App
