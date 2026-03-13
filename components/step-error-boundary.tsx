"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class StepErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] Step Error Boundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/10 rounded-lg border border-destructive/20"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              An error occurred while processing this step. Please try again or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
              </details>
            )}
          </div>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="gap-2 bg-transparent"
            aria-label="Retry this step"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
