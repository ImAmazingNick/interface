"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineTreeInputProps {
  defaultValue?: string
  level: number
  onConfirm: (value: string) => void
  onCancel: () => void
  isCollapsed?: boolean
}

export function InlineTreeInput({
  defaultValue = "New Folder",
  level,
  onConfirm,
  onCancel,
  isCollapsed,
}: InlineTreeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Auto-focus and select all text
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [])

  const handleConfirm = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed.length < 2 || trimmed.length > 50) {
      setHasError(true)
      setTimeout(() => setHasError(false), 300)
      inputRef.current?.focus()
      return
    }
    onConfirm(trimmed)
  }, [value, onConfirm])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
    // Stop propagation to prevent tree keyboard nav from interfering
    e.stopPropagation()
  }, [handleConfirm, onCancel])

  const handleBlur = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed.length >= 2 && trimmed.length <= 50) {
      onConfirm(trimmed)
    } else {
      onCancel()
    }
  }, [value, onConfirm, onCancel])

  if (isCollapsed) return null

  return (
    <div
      className="flex items-center gap-2 h-9 px-2 ml-2"
      style={{ paddingLeft: `${(level * 10) + 8}px` }}
    >
      <div className="flex items-center justify-center w-4 h-4">
        <FolderOpen className="h-4 w-4 text-orange-500" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        maxLength={50}
        className={cn(
          "flex-1 min-w-0 text-sm bg-transparent border rounded px-1.5 py-0.5 outline-none transition-colors duration-150",
          hasError
            ? "border-red-500 ring-1 ring-red-500/30"
            : "border-sidebar-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
        )}
        aria-label="Folder name"
      />
    </div>
  )
}
