"use client"

import type React from "react"
import type { ModelType } from "@/types/chat"

import { useState, useCallback, useRef } from "react"

export interface UseChatStateReturn {
  readonly isFocused: boolean
  readonly selectedModel: ModelType
  readonly inputValue: string
  readonly textareaRef: React.RefObject<HTMLTextAreaElement | null>
  readonly setIsFocused: (focused: boolean) => void
  readonly setSelectedModel: (model: ModelType) => void
  readonly setInputValue: (value: string) => void
  readonly handleFocus: () => void
  readonly handleBlur: () => void
  readonly handleModelChange: (value: ModelType) => void
  readonly handleSend: () => void
  readonly handleQuickAction: (action: string) => void
}

export function useChatState(): UseChatStateReturn {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4")
  const [inputValue, setInputValue] = useState<string>("")

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleFocus = useCallback((): void => setIsFocused(true), [])
  const handleBlur = useCallback((): void => setIsFocused(false), [])

  const handleQuickAction = useCallback((action: string): void => {
    setInputValue(action)
    textareaRef.current?.focus()
  }, [])

  const handleModelChange = useCallback((value: ModelType): void => {
    setSelectedModel(value)
  }, [])

  const handleSend = useCallback((): void => {
    if (inputValue.trim()) {
      console.log("[v0] Sending message:", inputValue, "with model:", selectedModel)
      setInputValue("")
    }
  }, [inputValue, selectedModel])

  return {
    isFocused,
    selectedModel,
    inputValue,
    textareaRef,
    setIsFocused,
    setSelectedModel,
    setInputValue,
    handleFocus,
    handleBlur,
    handleModelChange,
    handleSend,
    handleQuickAction,
  } as const
}
