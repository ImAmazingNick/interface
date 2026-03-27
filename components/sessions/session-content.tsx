"use client"

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { ArrowLeft, ArrowUp, User, Bot, PanelRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Session, SessionStatus } from "@/types/sessions"

interface SessionContentProps {
  session: Session
  onBack: () => void
  onSendMessage: (content: string) => void
  showProperties?: boolean
  onToggleProperties?: () => void
}

const STATUS_STYLES: Record<SessionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  completed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  paused: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
}

// --- Upgrade 2: Rich markdown rendering ---

function renderInlineMarkdown(text: string, isUser: boolean): ReactNode[] {
  // Match: **bold**, `inline code`, [link text](url)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className={cn(
            "px-1.5 py-0.5 rounded text-[13px] font-mono",
            isUser ? "bg-white/15" : "bg-muted/80 text-foreground/80",
          )}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline underline-offset-2",
            isUser
              ? "text-white hover:text-white/80"
              : "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300",
          )}
        >
          {linkMatch[1]}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function renderMarkdown(content: string, isUser: boolean): ReactNode[] {
  const lines = content.split("\n")
  const elements: ReactNode[] = []
  let codeBlock: string[] | null = null
  let codeBlockLang = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block toggle
    if (line.startsWith("```")) {
      if (codeBlock === null) {
        codeBlock = []
        codeBlockLang = line.slice(3).trim()
      } else {
        elements.push(
          <pre
            key={`code-${i}`}
            className={cn(
              "rounded-lg p-3 font-mono text-[13px] overflow-x-auto my-2",
              isUser
                ? "bg-black/15 text-white/90 border border-white/10"
                : "bg-muted/80 text-foreground/80 border border-border/40",
            )}
          >
            {codeBlockLang && (
              <span className={cn("text-[10px] uppercase tracking-wider font-medium block mb-2", isUser ? "text-white/40" : "text-muted-foreground/40")}>
                {codeBlockLang}
              </span>
            )}
            <code>{codeBlock.join("\n")}</code>
          </pre>,
        )
        codeBlock = null
        codeBlockLang = ""
      }
      continue
    }

    if (codeBlock !== null) {
      codeBlock.push(line)
      continue
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<br key={`br-${i}`} />)
      continue
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} className="font-medium text-sm mt-3 mb-1">
          {renderInlineMarkdown(line.slice(4), isUser)}
        </p>,
      )
      continue
    }
    if (line.startsWith("## ")) {
      elements.push(
        <p key={i} className="font-semibold text-sm mt-3 mb-1">
          {renderInlineMarkdown(line.slice(3), isUser)}
        </p>,
      )
      continue
    }

    // Bullet list
    if (line.startsWith("- ")) {
      elements.push(
        <p key={i} className="pl-4 flex gap-1.5">
          <span className={cn("select-none", isUser ? "text-white/50" : "text-muted-foreground/40")}>
            &bull;
          </span>
          <span className="flex-1">{renderInlineMarkdown(line.slice(2), isUser)}</span>
        </p>,
      )
      continue
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)$/)
    if (numMatch) {
      elements.push(
        <p key={i} className="pl-4 flex gap-1.5">
          <span className={cn("select-none tabular-nums", isUser ? "text-white/50" : "text-muted-foreground/40")}>
            {numMatch[1]}.
          </span>
          <span className="flex-1">{renderInlineMarkdown(numMatch[2], isUser)}</span>
        </p>,
      )
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className={i > 0 ? "mt-1.5" : ""}>
        {renderInlineMarkdown(line, isUser)}
      </p>,
    )
  }

  return elements
}

// --- Upgrade 3: Timestamp formatting ---

function formatMessageTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function SessionContent({ session, onBack, onSendMessage, showProperties, onToggleProperties }: SessionContentProps) {
  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [session.messages.length, session.id])

  // Auto-focus textarea on empty sessions
  useEffect(() => {
    if (session.messages.length === 0) {
      textareaRef.current?.focus()
    }
  }, [session.id, session.messages.length])

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }, [inputValue, onSendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // --- Upgrade 7: Escape key to go back ---
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.activeElement === textareaRef.current) {
          textareaRef.current?.blur()
          return
        }
        onBack()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onBack])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 h-14 flex items-center gap-3 px-5 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0"
            aria-label="Back to sessions list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/30 bg-muted/40 border border-border/30 rounded px-1 py-0.5 font-mono">
            esc
          </kbd>
        </div>
        <h2 className="text-[15px] font-semibold text-foreground truncate flex-1">
          {session.title}
        </h2>
        <Badge
          variant="outline"
          className={cn("text-[11px] capitalize", STATUS_STYLES[session.status])}
        >
          {session.status}
        </Badge>
        {session.agentModel && (
          <span className="text-[11px] text-muted-foreground/50 flex-shrink-0">
            {session.agentModel === "think" ? "Think" : "Fast"}
          </span>
        )}
        {onToggleProperties && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleProperties}
            className={cn(
              "h-8 w-8 p-0 rounded-md shrink-0",
              showProperties
                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
            )}
            aria-label={showProperties ? "Hide properties" : "Show properties"}
            title={showProperties ? "Hide properties" : "Show properties"}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages — Upgrade 9: animated session transitions */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={session.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="px-5 py-4 space-y-4"
          >
            {session.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">What can I help you with?</p>
                <p className="text-xs text-muted-foreground/50 mb-5 max-w-[260px]">
                  I can query your data, search the web, analyze trends, and create artifacts.
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-[360px]">
                  {[
                    "Compare last month's performance",
                    "Find top converting channels",
                    "Analyze recent trends",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => onSendMessage(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              session.messages.map((msg, i) => {
                const isUser = msg.role === "user"
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.03 * i }}
                    className={cn(
                      "group flex gap-3",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                    )}
                    <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                      <div
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm leading-relaxed",
                          isUser
                            ? "bg-violet-600 text-white dark:bg-violet-700"
                            : "bg-muted/60 text-foreground border border-border/40",
                        )}
                      >
                        {renderMarkdown(msg.content, isUser)}
                      </div>
                      <span
                        className={cn(
                          "text-[11px] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors duration-200 tabular-nums mt-1 px-1 select-none",
                        )}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-foreground/60" />
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}

            {/* Typing indicator — show when waiting for agent response */}
            {(session.messages.length > 0 && session.messages[session.messages.length - 1].role === "user") && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="bg-muted/60 border border-border/40 rounded-xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border bg-background px-5 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm border-border/60 rounded-xl focus-visible:ring-violet-500/30"
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="h-10 w-10 rounded-full p-0 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white flex-shrink-0"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
