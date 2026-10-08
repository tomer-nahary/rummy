import { useState } from 'react'
import type { GameState, Round } from '../types'
import { computeBalances, formatNis } from '../settlement'
import { uid } from '../storage'
import RoundModal from './RoundModal'

interface Props {
  state: GameState
  onUpdateState: (updater: (prev: GameState) => GameState) => void
  onFinishGame: () => void
}

export default function GameScreen({ state, onUpdateState, onFinishGame }: Props) {
  const [modalRound, setModalRound] = useState<Round | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const balances = computeBalances(state.players, state.rounds)
  const standings = [...state.players].sort(
    (a, b) => (balances.get(a.id) ?? 0) - (balances.get(b.id) ?? 0),
  )

  function submitRound(scores: Record<string, number>) {
    onUpdateState((prev) => {
      if (modalRound) {
        return {
          ...prev,
          rounds: prev.rounds.map((r) => (r.id === modalRound.id ? { ...r, scores } : r)),
        }
      }
      return { ...prev, rounds: [...prev.rounds, { id: uid(), scores }] }
    })
    setModalOpen(false)
    setModalRound(null)
  }

  function deleteRound(id: string) {
    if (!window.confirm('למחוק את הסבב?')) return
    onUpdateState((prev) => ({ ...prev, rounds: prev.rounds.filter((r) => r.id !== id) }))
  }

  function editRound(round: Round) {
    setModalRound(round)
    setModalOpen(true)
  }

  function finishGame() {
    setConfirmFinish(false)
    onFinishGame()
  }

  return (
    <section className="game-screen">
      <div className="section-header">
        <h2>יתרות נוכחיות</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setModalRound(null)
            setModalOpen(true)
          }}
        >
          סבב חדש
        </button>
      </div>

      {state.rounds.length === 0 ? (
        <p className="hint">טרם נוספו סבבים. לחץ על "סבב חדש" כדי להזין את הניקוד של הסבב הראשון.</p>
      ) : (
        <table className="balance-table">
          <thead>
            <tr>
              <th>שחקן</th>
              <th>ניקוד</th>
              <th>שווי</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="num">{balances.get(p.id) ?? 0}</td>
                <td className="num">{formatNis(balances.get(p.id) ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {state.rounds.length > 0 && (
        <>
          <h3 className="section-header">
            <span>היסטוריית סבבים</span>
            <span className="muted">({state.rounds.length})</span>
          </h3>
          <ul className="rounds-list">
            {state.rounds.map((round, i) => (
              <li key={round.id}>
                <span className="round-label">סבב {i + 1}</span>
                <span className="round-scores">
                  {state.players.map((p) => (
                    <span key={p.id} className="round-score-chip">
                      {p.name}: <b>{round.scores[p.id] ?? 0}</b>
                    </span>
                  ))}
                </span>
                <span className="round-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => editRound(round)}
                    aria-label={`ערוך סבב ${i + 1}`}
                  >
                    ערוך
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => deleteRound(round.id)}
                    aria-label={`מחק סבב ${i + 1}`}
                  >
                    מחק
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {confirmFinish ? (
        <div className="finish-confirm">
          <p>לסיים את המשחק ולחשב תשלומים?</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmFinish(false)}>
              ביטול
            </button>
            <button type="button" className="btn btn-primary" onClick={finishGame}>
              כן, סיים משחק
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-finish"
          disabled={state.rounds.length === 0}
          onClick={() => setConfirmFinish(true)}
        >
          סיים משחק
        </button>
      )}

      {modalOpen && (
        <RoundModal
          players={state.players}
          round={modalRound}
          roundNumber={modalRound ? state.rounds.findIndex((r) => r.id === modalRound.id) + 1 : state.rounds.length + 1}
          onSubmit={submitRound}
          onClose={() => {
            setModalOpen(false)
            setModalRound(null)
          }}
        />
      )}
    </section>
  )
}
