import { getSocket, addActiveGameSubscription, removeActiveGameSubscription } from './socket'
import i18n from '../i18n'

/** Current frontend lang for backend log i18n ('en' | 'ar'). */
function getLogLang(): 'en' | 'ar' {
  return i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

// Track subscriptions by gameId with reference counting
// This ensures game:subscribe is only emitted once per gameId,
// even when multiple hooks subscribe to the same game
const subscriptionRefs = new Map<string, number>()

/**
 * Subscribe to a game room. Uses reference counting to ensure
 * game:subscribe is only emitted once per gameId, even when
 * multiple hooks subscribe to the same game.
 *
 * @param gameId - The game ID to subscribe to
 * @returns A cleanup function that should be called when unsubscribing
 */
export function subscribeToGame(gameId: string): () => void {
  const socket = getSocket()

  // Increment reference count
  const currentCount = subscriptionRefs.get(gameId) || 0
  const newCount = currentCount + 1
  subscriptionRefs.set(gameId, newCount)

  // Only emit subscribe if this is the first subscription
  if (newCount === 1) {
    // Track this subscription for reconnection handling
    addActiveGameSubscription(gameId)

    socket.emit(
      'game:subscribe',
      { gameId, lang: getLogLang() },
      (response?: { success: boolean; error?: string }) => {
        if (response && !response.success) {
          console.error('Failed to subscribe to game:', response.error)
          // If subscription failed, decrement the ref count and remove from tracking
          subscriptionRefs.set(gameId, (subscriptionRefs.get(gameId) || 0) - 1)
          removeActiveGameSubscription(gameId)
        }
      }
    )
  }

  // Return cleanup function
  return () => {
    const count = subscriptionRefs.get(gameId) || 0
    if (count <= 1) {
      // Last subscription, emit unsubscribe
      subscriptionRefs.delete(gameId)
      removeActiveGameSubscription(gameId)
      socket.emit('game:unsubscribe', { gameId }, () => {
        // Unsubscribe callback - no action needed
      })
    } else {
      // Decrement reference count
      subscriptionRefs.set(gameId, count - 1)
    }
  }
}
