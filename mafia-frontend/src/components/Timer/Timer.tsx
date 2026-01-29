import { useEffect, useState } from 'react'

interface TimerProps {
  phaseEndTime?: Date | string
}

export function Timer({ phaseEndTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!phaseEndTime) {
      setTimeLeft(null)
      return
    }

    const endTime = phaseEndTime instanceof Date ? phaseEndTime : new Date(phaseEndTime)
    const updateTimer = () => {
      const now = new Date()
      const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
      setTimeLeft(diff)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [phaseEndTime])

  if (timeLeft === null) {
    return null
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isLowTime = timeLeft <= 10

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
        isLowTime
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      }`}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}
