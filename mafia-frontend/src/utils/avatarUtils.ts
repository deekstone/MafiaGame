export function getAvatarUrl(nickname: string, avatarSeed?: string | null): string {
  const seedValue = (avatarSeed && avatarSeed.trim()) || nickname
  const seed = encodeURIComponent(seedValue)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

export function generateAvatarSeed(): string {
  // Prefer crypto for uniqueness; fallback for older browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `seed-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

export function getInitials(nickname: string): string {
  return nickname
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(nickname: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
