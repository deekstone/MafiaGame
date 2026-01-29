import { useTranslation } from 'react-i18next'
import type { PlayerRole } from '../../types/game'
import { Text } from '../Text'

interface RoleDisplayProps {
  role: PlayerRole
}

const roleColors: Record<PlayerRole, string> = {
  mafia: 'bg-red-600 text-white',
  doctor: 'bg-blue-600 text-white',
  villager: 'bg-green-600 text-white',
}

const ROLE_DESC_KEYS: Record<PlayerRole, string> = {
  mafia: 'roles.mafiaDescription',
  doctor: 'roles.doctorDescription',
  villager: 'roles.villagerDescription',
}

export function RoleDisplay({ role }: RoleDisplayProps) {
  const { t } = useTranslation()
  const roleName = t(`roles.${role}`)

  return (
    <div className={`w-full p-4 rounded-lg shadow-lg mb-4 ${roleColors[role]}`}>
      <Text variant="h3" size="xl" weight="bold" className="mb-2">
        {t('roles.yourRole', { role: roleName })}
      </Text>
      <Text variant="p" size="sm" className="opacity-90">
        {t(ROLE_DESC_KEYS[role])}
      </Text>
    </div>
  )
}
