import { useState } from 'react'
import type { Player, Round } from '../types'

interface Props {
  players: Player[]
  round?: Round | null
  roundNumber: number
  onSubmit: (scores: Record<string, number>) => void
  onClose: () => void
}

export default function RoundModal({ players, round, roundNumber, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const p of players) {
      initial[p.id] = round ? String(round.scores[p.id] ?? '') : ''
    }
    return initial
  })
  const [error, setError] = useState('')

  function handleSubmit() {
    const scores: Record<string, number> = {}
    for (const p of players) {
      const raw = values[p.id]?.trim() ?? ''
      if (raw === '') {
        setError('יש להזין ניקוד לכל השחקנים')
        return
      }
      const num = Number(raw)
      if (Number.isNaN(num)) {
        setError('ניקוד חייב להיות מספר')
        return
      }
      scores[p.id] = num
    }
    setError('')
    onSubmit(scores)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2>סבב {roundNumber}</h2>
        {players.map((p) => (
          <div className="score-row" key={p.id}>
            <label htmlFor={`score-${p.id}`}>{p.name}</label>
            <input
              id={`score-${p.id}`}
              type="number"
              inputMode="numeric"
              value={values[p.id]}
              placeholder="ניקוד"
              onChange={(e) => {
                setValues((v) => ({ ...v, [p.id]: e.target.value }))
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
          </div>
        ))}
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            ביטול
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {round ? 'שמור שינויים' : 'שמור סבב'}
          </button>
        </div>
      </div>
    </div>
  )
}
