// In-memory storage for user profile (nickname + avatar seed)
type UserProfile = { nickname: string; avatarSeed: string; userColor: string }
const profiles = new Map<string, UserProfile>()
import { stringToColor } from "../utils/userColor";
export class NicknameManager {
  /**
   * Get full user profile (nickname + avatar seed)
   */
  static getProfile(userId: string): UserProfile | undefined {
    return profiles.get(userId)
  }

  /**
   * Set a nickname (and avatar seed) for a user.
   * If avatarSeed is omitted/empty, defaults to nickname (stable fallback).
   */
  static setNickname(userId: string, nickname: string, avatarSeed?: string, userColor?: string): void {
    if (!nickname || nickname.trim().length === 0) {
      throw new Error('Nickname is required')
    }
    
    const trimmedNickname = nickname.trim()
    const trimmedSeed =
      typeof avatarSeed === 'string' && avatarSeed.trim().length > 0
        ? avatarSeed.trim()
        : trimmedNickname

    profiles.set(userId, { nickname: trimmedNickname, avatarSeed: trimmedSeed, userColor: userColor || stringToColor(userId) })
  }

  /**
   * Get a nickname for a user
   */
  static getNickname(userId: string): string | undefined {
    return this.getProfile(userId)?.nickname
  }

  /**
   * Get avatar seed for a user
   */
  static getAvatarSeed(userId: string): string | undefined {
    return this.getProfile(userId)?.avatarSeed
  }

  static getUserColor(userId: string): string |undefined {
    return this.getProfile(userId)?.userColor;
  }
  /**
   * Set avatar seed for a user (nickname must already exist)
   */
  static setAvatarSeed(userId: string, avatarSeed: string): void {
    if (!avatarSeed || avatarSeed.trim().length === 0) {
      throw new Error('Avatar seed is required')
    }
    const existing = profiles.get(userId)
    if (!existing) {
      throw new Error('Cannot set avatar seed without nickname')
    }
    profiles.set(userId, { ...existing, avatarSeed: avatarSeed.trim() })
  }

  /**
   * Get all nicknames
   */
  static getAllNicknames(): Map<string, [string, string, string]> {
    return new Map(Array.from(profiles.entries()).map(([userId, p]) => [userId, [p.nickname, p.avatarSeed, p.userColor]] as [string, [string, string, string]]))
  }

  /**
   * Check if user has a nickname
   */
  static hasNickname(userId: string): boolean {
    return profiles.has(userId)
  }

  /**
   * Delete a nickname (and avatar seed)
   */
  static deleteNickname(userId: string): boolean {
    return profiles.delete(userId)
  }
}
