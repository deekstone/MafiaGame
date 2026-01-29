import type { ButtonHTMLAttributes, MouseEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'

interface StartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onStart: () => void
}

export function StartButton({ onStart, onClick, disabled, ...props }: StartButtonProps) {
  const { t } = useTranslation()

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onStart()
    onClick?.(e)
  }
  return (
    <Button
      variant="success"
      size="lg"
      onClick={handleClick}
      disabled={disabled}
      touchFriendly
      withShadow
      className="mb-6 w-full md:w-auto"
      {...props}
    >
      {t('game.startGame')}
    </Button>
  )
}
