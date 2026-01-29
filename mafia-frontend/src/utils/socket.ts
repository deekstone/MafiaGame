import { io, type Socket } from 'socket.io-client'
import { BACKEND_URL } from '../constants'
import i18n from '../i18n'

// Singleton socket instance to persist across component mounts/unmounts
// This ensures all hooks and components share the same socket connection
let globalSocket: Socket | null = null

// Track active game subscriptions for reconnection
const activeGameSubscriptions = new Set<string>()

/**
 * Get the list of active game subscriptions
 * Used for re-subscribing after reconnection
 */
export function getActiveGameSubscriptions(): string[] {
  return Array.from(activeGameSubscriptions)
}

/**
 * Track a game subscription
 */
export function addActiveGameSubscription(gameId: string): void {
  activeGameSubscriptions.add(gameId)
}

/**
 * Remove a game subscription from tracking
 */
export function removeActiveGameSubscription(gameId: string): void {
  activeGameSubscriptions.delete(gameId)
}

/**
 * Notify backend of frontend language for log i18n (en/ar).
 * No-op if socket not yet created.
 */
export function emitLogLang(lang: 'en' | 'ar'): void {
  if (globalSocket) {
    globalSocket.emit('user:set-lang', { lang })
  }
}

/**
 * Get or create the shared socket instance
 * This ensures only one socket connection is maintained across the entire app
 */
export function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(BACKEND_URL, { withCredentials: true })

    // Set up reconnection handlers
    setupReconnectionHandlers(globalSocket)
  }
  return globalSocket
}

/**
 * Set up socket reconnection and disconnect handlers
 */
function setupReconnectionHandlers(socket: Socket): void {
  // Handle Socket.IO automatic reconnection
  socket.on('reconnect', (attemptNumber: number) => {
    console.log(`[Reconnect] Socket reconnected (attempt: ${attemptNumber})`)

    const lang = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'

    // Notify backend about user reconnection (send lang for log i18n)
    socket.emit('user:reconnect', { lang })

    // Re-subscribe to all active game subscriptions
    const activeGames = getActiveGameSubscriptions()
    activeGames.forEach((gameId) => {
      console.log(`[Reconnect] Re-subscribing to game: ${gameId}`)
      socket.emit(
        'game:subscribe',
        { gameId, lang },
        (response?: { success: boolean; error?: string }) => {
          if (response && !response.success) {
            console.error(`[Reconnect] Failed to re-subscribe to game ${gameId}:`, response.error)
          } else {
            console.log(`[Reconnect] Successfully re-subscribed to game: ${gameId}`)
          }
        }
      )
    })
  })

  // Handle disconnect events
  socket.on('disconnect', (reason: string) => {
    console.log(`[Disconnect] Socket disconnected (reason: ${reason})`)
    // The backend will handle cleanup via ConnectionManager
    // We just log it here for debugging
  })

  // Handle connection errors
  socket.on('connect_error', (error: Error) => {
    console.error('[Connection Error]', error)
  })
}
