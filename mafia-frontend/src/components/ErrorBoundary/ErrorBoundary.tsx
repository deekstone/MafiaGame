import { Component, type ReactNode } from 'react'
import { Text } from '../Text'
import { Button } from '../Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <Text variant="h2" weight="bold" className="text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </Text>
            <Text variant="p" color="secondary" className="mb-4">
              {this.state.error.message || 'An unexpected error occurred'}
            </Text>
            <Button onClick={this.resetError} fullWidth>
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
