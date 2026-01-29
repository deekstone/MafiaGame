# Background Jobs

This directory contains scheduled background tasks and cron jobs.

## Game Cleanup Cron (`gameCleanupCron.ts`)

Scheduled job that automatically cleans up inactive games from memory.

**Purpose:**

- Prevents memory leaks by removing finished and cancelled games
- Runs automatically on a schedule to maintain server performance

**Schedule:**

- Runs daily at 04:00 AM server time
- Uses node-cron with pattern: `'0 4 * * *'`

**Functionality:**

- Calls `GameManager.deleteInactiveGames()` to remove all games with status `finished` or `cancelled`
- Logs the number of games deleted for monitoring

**Usage:**

- Automatically started when the server starts (called in `src/index.ts`)
- No manual intervention required

**Note:**

- This is a cleanup job for in-memory storage
- In a production environment with persistent storage, this might be replaced with database cleanup queries
