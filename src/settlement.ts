import type { GameState, Payment, Player, PlayerSummary, Round } from './types'

export const POINT_VALUE_NIS = 0.01

export function formatNis(points: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(points * POINT_VALUE_NIS)
}

export function formatNisRounded(points: number): string {
  const whole = Math.round(points * POINT_VALUE_NIS)
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(whole)
}

// Converts points to whole-shekel precision, expressed back in points
// (e.g. 360 -> 400, i.e. 3.60₪ -> 4₪), so summaries stay consistent
// with the rounded payment amounts.
export function roundToShekelPoints(points: number): number {
  return Math.round(points * POINT_VALUE_NIS) * 100
}

// Like formatNisRounded, but always shows the sign (+/−) for non-zero values.
export function formatNisRoundedSigned(points: number): string {
  const whole = Math.round(points * POINT_VALUE_NIS)
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    signDisplay: 'exceptZero',
  }).format(whole)
}

export function computeBalances(players: Player[], rounds: Round[]): Map<string, number> {
  const balances = new Map<string, number>()
  for (const p of players) balances.set(p.id, 0)
  for (const round of rounds) {
    for (const p of players) {
      const score = round.scores[p.id]
      if (typeof score === 'number' && !Number.isNaN(score)) {
        balances.set(p.id, (balances.get(p.id) ?? 0) + score)
      }
    }
  }
  return balances
}

// Higher points = worse: each player pays every player with fewer points
// the difference between their totals.
// Ordered by payer: the person who pays the most people first, all of his
// payments grouped together (ties broken by total amount paid).
export function computePayments(players: Player[], rounds: Round[]): Payment[] {
  const balances = computeBalances(players, rounds)
  const byPayer = new Map<string, Payment[]>()
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i]
      const b = players[j]
      const diff = (balances.get(a.id) ?? 0) - (balances.get(b.id) ?? 0)
      if (diff === 0) continue
      const worse = diff > 0 ? a : b
      const better = diff > 0 ? b : a
      const payment: Payment = { fromId: worse.id, toId: better.id, points: Math.abs(diff) }
      const list = byPayer.get(worse.id) ?? []
      list.push(payment)
      byPayer.set(worse.id, list)
    }
  }
  const payerGroups = [...byPayer.values()].sort((x, y) => {
    const countDiff = y.length - x.length
    if (countDiff !== 0) return countDiff
    return (
      y.reduce((s, p) => s + p.points, 0) - x.reduce((s, p) => s + p.points, 0)
    )
  })
  for (const group of payerGroups) {
    group.sort((x, y) => y.points - x.points)
  }
  return payerGroups.flat()
}

export function computeSummaries(
  players: Player[],
  rounds: Round[],
  payments: Payment[],
): PlayerSummary[] {
  const received = new Map<string, number>()
  const paid = new Map<string, number>()
  for (const p of players) {
    received.set(p.id, 0)
    paid.set(p.id, 0)
  }
  for (const payment of payments) {
    paid.set(payment.fromId, (paid.get(payment.fromId) ?? 0) + payment.points)
    received.set(payment.toId, (received.get(payment.toId) ?? 0) + payment.points)
  }
  const balances = computeBalances(players, rounds)
  return players.map((player) => {
    const recv = received.get(player.id) ?? 0
    const pay = paid.get(player.id) ?? 0
    return {
      player,
      totalPoints: balances.get(player.id) ?? 0,
      received: recv,
      paid: pay,
      net: recv - pay,
    }
  })
}

export function getGameStateSummary(state: GameState) {
  const payments = computePayments(state.players, state.rounds)
  const summaries = computeSummaries(state.players, state.rounds, payments)
  return { payments, summaries }
}
