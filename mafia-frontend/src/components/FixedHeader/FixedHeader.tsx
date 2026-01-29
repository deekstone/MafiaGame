import { ReactNode } from 'react'

interface FixedHeaderProps {
  children: ReactNode
}

export function FixedHeader({ children }: FixedHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4">{children}</div>
    </div>
  )
}
