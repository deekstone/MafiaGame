import { Game, Player } from '../types/game'

/**
 * While the game is in-progress, only the requesting player should see their own role.
 * Everyone else (including spectators) must not receive other players' roles.
 *
 * When the game is finished, roles can be revealed to everyone.
 */
export function maskRolesForViewer(game: Game, viewerUserId?: string): Game {
  // Only hide roles while actively playing
  if (game.status !== 'in-progress') {
    return game
  }

  const maskedPlayers: Player[] = game.players.map((p) => {
    if (viewerUserId && p.userId === viewerUserId) {
      return p
    }
    // Remove role for everyone else
    // (Leaving role as undefined so it won't serialize in JSON)
    const { role: _role, ...rest } = p
    return rest
  })

  return {
    ...game,
    players: maskedPlayers,
  }
}

