import clockTickingSound from '../assets/sounds/clock-ticking.mp3'
import nightAmbienceSound from '../assets/sounds/night-ambience.mp3'
import roosterCrowingSound from '../assets/sounds/rooster-crowing.mp3'

class AudioManager {
  private nightAmbienceAudio: HTMLAudioElement | null = null
  private isUnlocked = false
  private unlockPromise: Promise<void> | null = null

  /**
   * Unlock audio ONCE from a user gesture (Start / Join button)
   */
  async unlock(): Promise<void> {
    if (this.isUnlocked) return
    if (this.unlockPromise) return this.unlockPromise
    console.log('asdasd')
    this.unlockPromise = this.doUnlock()
    return this.unlockPromise
  }

  private async doUnlock(): Promise<void> {
    console.log('unlocked')
    try {
      // Minimal, safe unlock: one dummy play
      const dummy = new Audio()
      await dummy.play().catch(() => { })
      this.isUnlocked = true
    } catch {
      this.isUnlocked = true
    }
  }

  /**
   * -------- Night ambience (long sound, reusable)
   */
  async playNightAmbience(): Promise<void> {
    try {
      if (!this.nightAmbienceAudio) {
        this.nightAmbienceAudio = new Audio(nightAmbienceSound)
        this.nightAmbienceAudio.volume = 0.5
      }

      this.nightAmbienceAudio.currentTime = 0
      await this.nightAmbienceAudio.play()
    } catch (error) {
      console.debug('Could not play night ambience sound:', error)
    }
  }

  stopNightAmbience(): void {
    if (this.nightAmbienceAudio) {
      this.nightAmbienceAudio.pause()
      this.nightAmbienceAudio.currentTime = 0
    }
  }

  getNightAmbienceAudio(): HTMLAudioElement | null {
    return this.nightAmbienceAudio
  }

  /**
   * -------- Clock ticking (short SFX, always fresh)
   */
  async playClockTicking(): Promise<void> {
    try {
      const audio = new Audio(clockTickingSound)
      audio.volume = 0.5
      audio.currentTime = 0
      await audio.play()
    } catch (error) {
      console.debug('Could not play clock ticking sound:', error)
    }
  }

  stopClockTicking(): void {
    // No-op: short sound, we just let it finish or recreate next time
  }

  /**
   * -------- Rooster crowing (short SFX, always fresh)
   */
  async playRoosterCrowing(): Promise<void> {
    try {
      const audio = new Audio(roosterCrowingSound)
      audio.volume = 0.5
      audio.currentTime = 0
      await audio.play()
    } catch (error) {
      console.debug('Could not play rooster crowing sound:', error)
    }
  }
}

export const audioManager = new AudioManager()
