"use client"

import { useCallback, useEffect } from "react"

interface UseKeyboardShortcutsProps {
  readonly onSend: () => void
  readonly inputValue: string
}

export function useKeyboardShortcuts({ onSend, inputValue }: UseKeyboardShortcutsProps): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      // Send message with Cmd/Ctrl + Enter
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && inputValue.trim()) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend, inputValue],
  )

  useEffect((): (() => void) => {
    document.addEventListener("keydown", handleKeyDown)
    return (): void => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}
