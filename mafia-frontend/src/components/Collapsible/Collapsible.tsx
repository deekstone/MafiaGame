import { useState, type ReactNode } from 'react'
import { Text } from '../Text'

interface CollapsibleProps {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function Collapsible({
  title,
  children,
  defaultCollapsed = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: CollapsibleProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className={className}>
      <div className={`flex items-center justify-between ${headerClassName}`}>
        <Text variant="h2">{title}</Text>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div
        className={`transition-all duration-200 ${
          isCollapsed ? 'md:block hidden' : 'block'
        } ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  )
}
