export function getAvatarUrl(nickname: string | null | undefined, avatarSeed?: string | null): string {
  const seedValue = (avatarSeed && avatarSeed.trim()) || nickname?.trim() || 'player'
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

export function getInitials(nickname: string | null | undefined): string {
  const safeNickname = nickname?.trim() || ''
  if (!safeNickname) {
    return '??'
  }

  return safeNickname
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(nickname: string | null | undefined): string {
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
  const safeNickname = nickname?.trim() || ''
  let hash = 0
  for (let i = 0; i < safeNickname.length; i++) {
    hash = safeNickname.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
