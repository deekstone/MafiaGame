import { ReactNode } from 'react'
import { FixedHeader } from '../FixedHeader'

interface PageLayoutProps {
  headerContent: ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | 'full' | string
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full',
}

export function PageLayout({ headerContent, children, maxWidth = '6xl' }: PageLayoutProps) {
  const maxWidthClass =
    maxWidthClasses[maxWidth] ||
    (typeof maxWidth === 'string' && maxWidth.startsWith('max-w-') ? maxWidth : `max-w-${maxWidth}`)

  return (
    <div className="min-h-screen">
      <FixedHeader>{headerContent}</FixedHeader>

      <div className="pt-24 p-4">
        <div className={`${maxWidthClass} mx-auto`}>{children}</div>
      </div>
    </div>
  )
}
