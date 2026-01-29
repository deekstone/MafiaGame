import { type ReactNode, type HTMLAttributes } from 'react'

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label'
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
type TextColor = 'primary' | 'secondary' | 'muted' | 'white' | 'inherit'
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  variant?: TextVariant
  size?: TextSize
  color?: TextColor
  weight?: TextWeight
  children: ReactNode
  className?: string
  as?: TextVariant | 'label' // Allow overriding the semantic element
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

const colorClasses: Record<TextColor, string> = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-400',
  white: 'text-white',
  inherit: 'text-inherit',
}

const weightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const defaultVariants: Record<
  TextVariant,
  { size: TextSize; weight: TextWeight; color: TextColor }
> = {
  h1: { size: '2xl', weight: 'bold', color: 'primary' },
  h2: { size: '2xl', weight: 'semibold', color: 'primary' },
  h3: { size: 'base', weight: 'semibold', color: 'primary' },
  h4: { size: 'base', weight: 'semibold', color: 'primary' },
  h5: { size: 'sm', weight: 'semibold', color: 'primary' },
  h6: { size: 'xs', weight: 'semibold', color: 'primary' },
  p: { size: 'base', weight: 'normal', color: 'primary' },
  span: { size: 'base', weight: 'normal', color: 'inherit' },
  label: { size: 'sm', weight: 'medium', color: 'secondary' },
}

export function Text({
  variant = 'p',
  size,
  color,
  weight,
  children,
  className = '',
  as,
  ...props
}: TextProps) {
  const Component = as || variant
  const defaults = defaultVariants[variant]

  const finalSize = size ?? defaults.size
  const finalColor = color ?? defaults.color
  const finalWeight = weight ?? defaults.weight

  const classes = [
    sizeClasses[finalSize],
    colorClasses[finalColor],
    weightClasses[finalWeight],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
