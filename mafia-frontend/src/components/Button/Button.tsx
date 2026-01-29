import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
  className?: string
  touchFriendly?: boolean
  withShadow?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white',
  secondary:
    'bg-gray-300 hover:bg-gray-400 active:bg-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800',
  success:
    'bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-4 text-sm',
  md: 'py-2 px-4',
  lg: 'py-3 px-6',
}

const defaultVariants: Record<ButtonVariant, { size: ButtonSize; weight: string }> = {
  primary: { size: 'md', weight: 'font-semibold' },
  secondary: { size: 'md', weight: 'font-semibold' },
  success: { size: 'md', weight: 'font-semibold' },
  danger: { size: 'md', weight: 'font-semibold' },
}

export function Button({
  variant = 'primary',
  size,
  fullWidth = false,
  children,
  className = '',
  disabled,
  touchFriendly = false,
  withShadow = false,
  ...props
}: ButtonProps) {
  const defaults = defaultVariants[variant]

  const finalSize = size ?? defaults.size
  const finalWeight = defaults.weight

  const classes = [
    variantClasses[variant],
    sizeClasses[finalSize],
    finalWeight,
    'rounded-lg',
    'transition-colors',
    'duration-200',
    fullWidth ? 'w-full' : '',
    touchFriendly ? 'min-h-[44px] touch-manipulation' : '',
    withShadow ? 'shadow-md hover:shadow-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
