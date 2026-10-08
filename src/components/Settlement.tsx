import type { GameState } from '../types'
import { formatNis, getGameStateSummary } from '../settlement'

interface Props {
  state: GameState
  onReturnToGame: () => void
  onNewGame: () => void
}

export default function Settlement({ state, onReturnToGame, onNewGame }: Props) {
  const { payments, summaries } = getGameStateSummary(state)
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? 'שחקן'

  return (
    <section className="settlement">
      <h2>חישוב תשלומים</h2>

      {payments.length === 0 ? (
        <p className="hint">כל השחקנים באותו ניקוד - אין תשלומים!</p>
      ) : (
        <>
          <h3>מי משלם למי</h3>
          <ul className="payments-list">
            {payments.map((p, i) => (
              <li key={i}>
                <span className="payment-line">
                  <b>{nameOf(p.fromId)}</b> משלם ל<b>{nameOf(p.toId)}</b>
                </span>
                <span className="payment-amount">
                  {p.points} נק&apos; ({formatNis(p.points)})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>סיכום לשחקן</h3>
      <table className="balance-table">
        <thead>
          <tr>
            <th>שחקן</th>
            <th>ניקוד</th>
            <th>מקבל</th>
            <th>משלם</th>
            <th>סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => (
            <tr key={s.player.id}>
              <td>{s.player.name}</td>
              <td className="num">{s.totalPoints}</td>
              <td className="num">{s.received > 0 ? formatNis(s.received) : '-'}</td>
              <td className="num">{s.paid > 0 ? formatNis(s.paid) : '-'}</td>
              <td className={`num ${s.net > 0 ? 'positive' : s.net < 0 ? 'negative' : ''}`}>
                {s.net === 0 ? '-' : s.net > 0 ? `+${formatNis(s.net)}` : `-${formatNis(-s.net)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal-actions">
        <button type="button" className="btn btn-primary" onClick={onReturnToGame}>
          חזור למשחק
        </button>
        <button type="button" className="btn btn-danger" onClick={onNewGame}>
          משחק חדש
        </button>
      </div>
    </section>
  )
}
