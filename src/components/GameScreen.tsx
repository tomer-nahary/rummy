import { useState } from 'react'
import type { GameState, Round } from '../types'
import { computeBalances } from '../settlement'
import { uid } from '../storage'
import RoundModal from './RoundModal'

interface Props {
  state: GameState
  onUpdateState: (updater: (prev: GameState) => GameState) => void
  onFinishGame: () => void
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export default function GameScreen({ state, onUpdateState, onFinishGame }: Props) {
  const [modalRound, setModalRound] = useState<Round | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const balances = computeBalances(state.players, state.rounds)

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
        <h2>טבלת סבבים</h2>
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

      {state.rounds.length === 0 && (
        <p className="hint">טרם נוספו סבבים. לחץ על "סבב חדש" כדי להזין את הניקוד של הסבב הראשון.</p>
      )}

      <div className="table-scroll">
        <table className="rounds-table">
          <thead>
            <tr>
              <th className="round-col">סבב</th>
              {state.players.map((p) => (
                <th key={p.id}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rounds.map((round, i) => (
              <tr key={round.id}>
                <td className="round-col">
                  <div className="round-cell">
                    <span className="round-num">{i + 1}</span>
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() => editRound(round)}
                      aria-label={`ערוך סבב ${i + 1}`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-icon-danger"
                      onClick={() => deleteRound(round.id)}
                      aria-label={`מחק סבב ${i + 1}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
                {state.players.map((p) => (
                  <td key={p.id} className="num">
                    {round.scores[p.id] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="round-col summary-label">סיכום</td>
              {state.players.map((p) => (
                <td key={p.id} className="num summary-value">
                  {balances.get(p.id) ?? 0}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

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