import { useState } from 'react'
import type { Player } from '../types'
import { uid } from '../storage'

interface Props {
  players: Player[]
  onChange: (players: Player[]) => void
  onStartGame: () => void
}

export default function PlayersSetup({ players, onChange, onStartGame }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function addPlayer() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('הזן שם שחקן')
      return
    }
    if (players.some((p) => p.name === trimmed)) {
      setError('שחקן בשם זה כבר קיים')
      return
    }
    onChange([...players, { id: uid(), name: trimmed }])
    setName('')
    setError('')
  }

  function removePlayer(id: string) {
    onChange(players.filter((p) => p.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addPlayer()
  }

  return (
    <section className="setup">
      <h2>השחקנים</h2>
      <div className="add-player-row">
        <input
          type="text"
          value={name}
          placeholder="שם שחקן"
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="btn btn-add" onClick={addPlayer}>
          הוסף שחקן
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {players.length === 0 ? (
        <p className="hint">הוסף לפחות 2 שחקנים כדי להתחיל משחק</p>
      ) : (
        <ul className="player-list">
          {players.map((p, i) => (
            <li key={p.id}>
              <span className="player-name">
                {i + 1}. {p.name}
              </span>
              <button
                type="button"
                className="btn btn-remove"
                onClick={() => removePlayer(p.id)}
                aria-label={`הסר את ${p.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={players.length < 2}
        onClick={onStartGame}
      >
        התחל משחק
      </button>
    </section>
  )
}
