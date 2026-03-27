"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { X, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { ThoughtStepItem } from "./thought-step-item"
import { SearchInput } from "@/components/shared/search-input"
import { THOUGHT_STEP_TYPE_CONFIG } from "@/constants/sessions"
import { cn } from "@/lib/utils"
import type { ThoughtStep, ThoughtStepType } from "@/types/sessions"

interface ChainOfThoughtsPanelProps {
  steps: ThoughtStep[]
  isLive: boolean
  onClose: () => void
}

export function ChainOfThoughtsPanel({ steps, isLive, onClose }: ChainOfThoughtsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<ThoughtStepType | null>(null)

  // Auto-scroll to bottom when new steps arrive (only if live)
  useEffect(() => {
    if (isLive && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [steps.length, isLive])

  const completedCount = steps.filter((s) => s.status === "completed").length
  const activeStep = steps.find((s) => s.status === "active")
  const activeCount = activeStep ? 1 : 0

  const uniqueTypes = useMemo(() => [...new Set(steps.map(s => s.type))], [steps])

  const filteredSteps = useMemo(() => {
    return steps.filter((step) => {
      if (typeFilter && step.type !== typeFilter) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesTitle = step.title.toLowerCase().includes(term)
        const matchesContent = step.content.toLowerCase().includes(term)
        const matchesQuery = step.metadata?.query?.toLowerCase().includes(term) ?? false
        const matchesUrl = step.metadata?.url?.toLowerCase().includes(term) ?? false
        if (!matchesTitle && !matchesContent && !matchesQuery && !matchesUrl) return false
      }
      return true
    })
  }, [steps, searchTerm, typeFilter])

  const isFiltering = searchTerm !== "" || typeFilter !== null

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-5 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.h2
              key="thoughts-title"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-[15px] font-semibold text-foreground truncate"
            >
              Thoughts
            </motion.h2>
          </AnimatePresence>
          <span className="text-[11px] tabular-nums rounded-full px-1.5 py-0.5 bg-muted/80 text-muted-foreground/60 flex-shrink-0">
            {isFiltering ? `${filteredSteps.length}/${steps.length}` : `${completedCount}/${steps.length}`}
          </span>
          {isLive && activeStep && (
            <span className={cn("flex items-center gap-1 text-[11px]", THOUGHT_STEP_TYPE_CONFIG[activeStep.type].color)}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              {THOUGHT_STEP_TYPE_CONFIG[activeStep.type].label}...
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0"
          aria-label="Close thoughts panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter bar */}
      {steps.length >= 3 && (
        <div className="flex-shrink-0 px-5 py-2 border-b border-border/40 flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Filter steps…"
            className="flex-1"
            inputClassName="h-7 text-xs"
          />
          <div className="flex items-center gap-1">
            {uniqueTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
                  typeFilter === type
                    ? THOUGHT_STEP_TYPE_CONFIG[type].bgColor + " " + THOUGHT_STEP_TYPE_CONFIG[type].color
                    : "text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/40"
                )}
              >
                {THOUGHT_STEP_TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-4">
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <Brain className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground/60">No thoughts yet</p>
              <p className="text-xs text-muted-foreground/40 mt-1">
                Reasoning steps will appear here
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredSteps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * i }}
                >
                  <ThoughtStepItem
                    step={step}
                    index={i}
                    isLast={i === filteredSteps.length - 1}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
