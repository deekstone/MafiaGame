import cron from 'node-cron'
import { GameManager } from '../services/gameManager'

export function startGameCleanupCron() {
  // Runs every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    const deleted = GameManager.deleteInactiveGames()

    console.log(`[CLEANUP] Deleted ${deleted} inactive games at ${new Date().toISOString()}`)
  })
}
