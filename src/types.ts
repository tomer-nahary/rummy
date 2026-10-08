export interface Player {
  id: string
  name: string
}

export interface Round {
  id: string
  scores: Record<string, number>
}

export interface GameState {
  players: Player[]
  rounds: Round[]
  finished: boolean
}

export interface Payment {
  fromId: string
  toId: string
  points: number
}

export interface PlayerSummary {
  player: Player
  totalPoints: number
  received: number
  paid: number
  net: number
}
