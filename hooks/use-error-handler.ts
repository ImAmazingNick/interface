"use client"

import { useCallback } from "react"

interface ErrorHandlerOptions {
  onError?: (error: Error) => void
  showToast?: boolean
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const handleError = useCallback(
    (error: Error | unknown, context?: string) => {
      const errorObj = error instanceof Error ? error : new Error(String(error))

      console.error(`Error${context ? ` in ${context}` : ""}:`, errorObj)

      options.onError?.(errorObj)

      if (options.showToast) {
        // In a real app, you would integrate with your toast system here
        console.warn("Toast notification would be shown:", errorObj.message)
      }
    },
    [options],
  )

  const handleAsyncError = useCallback(
    async (asyncFn: () => Promise<any>, context?: string): Promise<any | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error, context)
        return null
      }
    },
    [handleError],
  )

  return { handleError, handleAsyncError }
}
