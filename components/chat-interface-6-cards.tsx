"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorBoundary } from "@/components/ui/error-boundary-new"
import { LazyShader } from "@/components/ui/lazy-shader"
import { Link, Mic, ArrowUp, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { useChatState } from "@/hooks/use-chat-state"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { QUICK_ACTIONS, ANIMATIONS } from "@/lib/welcome-constants"
import { memo, useCallback, useMemo, useState, useRef, useEffect } from "react"
import { TemplatesGrid6Cards } from "@/components/templates-grid"

const MORE_ACTIONS = [
  "Translate text",
  "Fix grammar",
  "Make it shorter",
  "Make it longer",
  "Change tone",
  "Add examples",
  "Create outline",
  "Find sources",
]

const QuickActionButton = memo(
  ({ action, index, onClick }: { action: string; index: number; onClick: (action: string) => void }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(action)}
      className="h-10 px-4 text-sm rounded-full bg-card/50 border-purple-200/30 hover:border-purple-300/60 hover:bg-purple-50/70 hover:scale-110 dark:border-purple-800/30 dark:hover:border-purple-700/60 dark:hover:bg-purple-950/50 text-muted-foreground hover:text-foreground transition-all duration-300 ease-out shadow-sm hover:shadow-lg cursor-pointer active:scale-105"
      aria-label={`Quick action: ${action}`}
      data-testid={`quick-action-${index}`}
    >
      {action}
    </Button>
  ),
)

QuickActionButton.displayName = "QuickActionButton"

const MoreActionsDropdown = memo(({ onActionSelect }: { onActionSelect: (action: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleActionClick = (action: string) => {
    onActionSelect(action)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 text-sm rounded-full bg-card/50 border-purple-200/30 hover:border-purple-300/60 hover:bg-purple-50/70 hover:scale-110 dark:border-purple-800/30 dark:hover:border-purple-700/60 dark:hover:bg-purple-950/50 text-muted-foreground hover:text-foreground transition-all duration-300 ease-out shadow-sm hover:shadow-lg cursor-pointer active:scale-105"
        aria-label="More quick actions"
        data-testid="more-actions-button"
      >
        <span>More</span>
        <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 left-0 bg-popover border border-border rounded-xl shadow-lg z-50 min-w-[160px] p-1"
            data-testid="more-actions-dropdown"
          >
            {MORE_ACTIONS.map((action, index) => (
              <button
                key={action}
                onClick={() => handleActionClick(action)}
                className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-150 cursor-pointer"
                data-testid={`more-action-${index}`}
              >
                {action}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

MoreActionsDropdown.displayName = "MoreActionsDropdown"

import type { ArtifactPanelContent } from "@/types"

export function ChatInterface6Cards({ onArtifactGenerated }: { onArtifactGenerated?: (content: ArtifactPanelContent) => void }) {
  const {
    isFocused,
    selectedModel,
    inputValue,
    textareaRef,
    handleFocus,
    handleBlur,
    handleQuickAction,
    handleModelChange,
    handleSend,
    setInputValue,
  } = useChatState()

  const themeColors = useThemeColors()

  const handleSendWithArtifact = useCallback(() => {
    if (inputValue.trim() && onArtifactGenerated) {
      onArtifactGenerated({
        type: 'ai-artifact',
        title: 'Generated Result',
        artifactType: 'document',
      })
    }
    handleSend()
  }, [inputValue, handleSend, onArtifactGenerated])

  useKeyboardShortcuts({ onSend: handleSendWithArtifact, inputValue })

  const handleTemplateSelect = (prompt: string) => {
    setInputValue(prompt)
    textareaRef.current?.focus()
  }

  const quickActionButtons = useMemo(
    () =>
      QUICK_ACTIONS.map((action, index) => (
        <QuickActionButton key={action} action={action} index={index} onClick={handleQuickAction} />
      )),
    [handleQuickAction],
  )

  const isInputEmpty = useMemo(() => !inputValue.trim(), [inputValue])

  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-4 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl relative">
        <div className="flex flex-row items-center mb-2">
          <motion.div
            id="circle-ball"
            className="relative flex items-center justify-center z-10"
            animate={{
              y: isFocused ? 50 : 0,
              opacity: isFocused ? 0 : 100,
              filter: isFocused ? "blur(4px)" : "blur(0px)",
              rotate: isFocused ? 180 : 0,
            }}
            transition={ANIMATIONS.FOCUS}
            data-testid="shader-orb"
          >
            <div className="z-10 absolute bg-foreground/5 h-11 w-11 rounded-full backdrop-blur-[3px]">
              <div className="h-[2px] w-[2px] bg-foreground rounded-full absolute top-4 left-4  blur-[1px]" />
              <div className="h-[2px] w-[2px] bg-foreground rounded-full absolute top-3 left-7  blur-[0.8px]" />
              <div className="h-[2px] w-[2px] bg-foreground rounded-full absolute top-8 left-2  blur-[1px]" />
              <div className="h-[2px] w-[2px] bg-foreground rounded-full absolute top-5 left-9 blur-[0.8px]" />
              <div className="h-[2px] w-[2px] bg-foreground rounded-full absolute top-7 left-7  blur-[1px]" />
            </div>
            <ErrorBoundary>
              <LazyShader component="orb" color={themeColors.liquidMetalColor} />
            </ErrorBoundary>
          </motion.div>

          <motion.p
            className="text-muted-foreground text-xl font-light z-10"
            animate={{
              y: isFocused ? 50 : 0,
              opacity: isFocused ? 0 : 100,
              filter: isFocused ? "blur(4px)" : "blur(0px)",
            }}
            transition={ANIMATIONS.FOCUS}
          >
            Hey there! I'm here to help with anything you need
          </motion.p>
        </div>

        <div className="relative">
          <ErrorBoundary>
            <LazyShader
              component="border"
              isVisible={isFocused}
              backgroundColor={themeColors.pulsingBorderBack}
              colors={themeColors.pulsingBorderColors}
            />
          </ErrorBoundary>

          <motion.div
            className="relative bg-card rounded-2xl p-4 z-10 border"
            animate={{
              borderColor: isFocused ? themeColors.focusBorderColor : "hsl(var(--border))",
            }}
            transition={ANIMATIONS.BORDER}
            data-testid="chat-input-container"
          >
            <div className="relative mb-6">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[80px] resize-none bg-transparent border-none text-foreground text-base placeholder:text-muted-foreground focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&:focus]:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:outline-none"
                onFocus={handleFocus}
                onBlur={handleBlur}
                aria-label="Chat message input"
                data-testid="message-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full bg-secondary hover:bg-purple-100 dark:hover:bg-purple-900/30 text-secondary-foreground hover:text-purple-600 dark:hover:text-purple-400 p-0 transition-all duration-300 ease-out hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-900/30 group"
                  aria-label="Attach file"
                  data-testid="attach-button"
                >
                  <Link className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-active:rotate-6" />
                </Button>
                <div className="flex items-center">
                  <Select value={selectedModel} onValueChange={handleModelChange}>
                    <SelectTrigger
                      className="bg-secondary border-border text-foreground hover:bg-secondary/80 text-xs rounded-full px-3 h-8 min-w-[100px]"
                      aria-label="Select AI model"
                      data-testid="model-selector"
                    >
                      <div className="flex items-center gap-2">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl">
                      <SelectItem value="fast" className="text-popover-foreground hover:bg-accent rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" aria-hidden="true">
                            ⚡
                          </span>
                          Fast
                        </div>
                      </SelectItem>
                      <SelectItem value="think" className="text-popover-foreground hover:bg-accent rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" aria-hidden="true">
                            🧠
                          </span>
                          Think
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full p-0 bg-secondary hover:bg-red-100 dark:hover:bg-red-900/30 text-secondary-foreground hover:text-red-600 dark:hover:text-red-400 p-0 transition-all duration-300 ease-out hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/30 group relative overflow-hidden"
                  aria-label="Voice input"
                  data-testid="voice-button"
                >
                  <div className="absolute inset-0 bg-red-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100" />
                  <Mic className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-active:scale-90 relative z-10" />
                  <div className="absolute inset-0 rounded-full border-2 border-red-400/0 group-hover:border-red-400/30 transition-colors duration-300" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendWithArtifact}
                  disabled={isInputEmpty}
                  className="h-10 w-10 rounded-full p-0 bg-purple-900 hover:bg-purple-800 disabled:bg-purple-900/50 text-white border-0 transition-colors"
                  aria-label={`Send message${inputValue.trim() ? `: ${inputValue.slice(0, 50)}${inputValue.length > 50 ? "..." : ""}` : ""}`}
                  data-testid="send-button"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-4 flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isFocused ? 0 : 1, y: isFocused ? 10 : 0 }}
          transition={ANIMATIONS.CHIPS}
          role="group"
          aria-label="Quick action suggestions"
          data-testid="quick-actions"
        >
          {quickActionButtons}
          <MoreActionsDropdown onActionSelect={handleQuickAction} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFocused ? 0 : 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-full"
      >
        <TemplatesGrid6Cards onTemplateSelect={handleTemplateSelect} />
      </motion.div>
    </div>
  )
}
