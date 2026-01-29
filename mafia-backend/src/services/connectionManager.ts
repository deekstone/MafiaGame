import { Socket } from 'socket.io'
import { NicknameManager } from './nicknameManager'

/**
 * Manages user socket connections
 * Tracks which users are connected and their associated socket IDs
 */
export class ConnectionManager {
  // Map userId -> Set of socketIds (users can have multiple connections)
  private static userSockets = new Map<string, Set<string>>()

  // Map socketId -> userId (for quick lookup)
  private static socketUsers = new Map<string, string>()

  /**
   * Register a new socket connection for a user
   */
  static connect(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socketId)
    this.socketUsers.set(socketId, userId)

    console.log(`[Connection] User ${userId} connected (socket: ${socketId})`)
    console.log(
      `[Connection] User ${userId} now has ${this.userSockets.get(userId)!.size} active connection(s)`
    )
  }

  /**
   * Unregister a socket connection
   */
  static disconnect(socketId: string): void {
    const userId = this.socketUsers.get(socketId)
    if (!userId) {
      return
    }

    const userSocketSet = this.userSockets.get(userId)
    if (userSocketSet) {
      userSocketSet.delete(socketId)
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId)
        console.log(`[Connection] User ${userId} disconnected (no active connections)`)
      } else {
        console.log(
          `[Connection] User ${userId} disconnected (socket: ${socketId}, ${userSocketSet.size} connection(s) remaining)`
        )
      }
    }

    this.socketUsers.delete(socketId)
  }

  /**
   * Check if a user is currently connected
   */
  static isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId)
    return sockets !== undefined && sockets.size > 0
  }

  /**
   * Get all socket IDs for a user
   */
  static getUserSockets(userId: string): Set<string> {
    return this.userSockets.get(userId) || new Set()
  }

  /**
   * Get the userId for a socket ID
   */
  static getUserId(socketId: string): string | undefined {
    return this.socketUsers.get(socketId)
  }

  /**
   * Get all connected user IDs
   */
  static getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys())
  }

  /**
   * Get total number of active connections
   */
  static getTotalConnections(): number {
    return this.socketUsers.size
  }

  /**
   * Get connection count for a specific user
   */
  static getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0
  }

  /**
   * Get all online players with their nicknames
   * Returns array of { userId, nickname, avatarSeed } objects
   * Includes all connected users, even if they don't have a nickname set yet
   */
  static getOnlinePlayers(): Array<{ userId: string; nickname: string; avatarSeed: string }> {
    const connectedUserIds = this.getConnectedUsers()
    return connectedUserIds.map((userId) => {
      const profile = NicknameManager.getProfile(userId)
      const nickname = profile?.nickname || 'Unknown'
      const avatarSeed = profile?.avatarSeed || nickname
      return { userId, nickname, avatarSeed }
    })
  }
}
