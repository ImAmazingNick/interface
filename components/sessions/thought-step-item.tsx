"use client"

import { memo, useState, useEffect } from "react"
import {
  Globe,
  CheckCircle2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Clock,
  Copy,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { THOUGHT_STEP_TYPE_CONFIG } from "@/constants/sessions"
import type { ThoughtStep, ThoughtStepStatus } from "@/types/sessions"

const STATUS_ICON: Record<ThoughtStepStatus, typeof CheckCircle2 | null> = {
  completed: CheckCircle2,
  active: Loader2,
  pending: Clock,
  error: AlertCircle,
}

interface ThoughtStepItemProps {
  step: ThoughtStep
  index: number
  isLast: boolean
}

export const ThoughtStepItem = memo(function ThoughtStepItem({
  step,
  index,
  isLast,
}: ThoughtStepItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const config = THOUGHT_STEP_TYPE_CONFIG[step.type]
  const TypeIcon = config.icon
  const StatusIcon = STATUS_ICON[step.status]

  // Ticking elapsed counter for active steps
  useEffect(() => {
    if (step.status !== "active") return
    const start = step.timestamp.getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [step.status, step.timestamp])

  return (
    <div className="relative flex gap-3 group">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Numbered circle with type icon */}
        <div
          className={cn(
            "relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
            config.bgColor,
            step.status === "active" && "ring-2 ring-violet-400/50 animate-pulse",
          )}
        >
          <TypeIcon className={cn("h-4 w-4", config.color)} />
          {/* Step number badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-border text-[9px] font-bold flex items-center justify-center text-muted-foreground tabular-nums">
            {index + 1}
          </span>
        </div>
        {/* Vertical line */}
        {!isLast && (
          <div className="w-px flex-1 min-h-[16px] bg-border/60 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-4 min-w-0", isLast && "pb-0")}>
        {/* Header row */}
        <div className="flex items-center gap-2 group/header">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {step.title}
            </span>
            {/* Status indicator */}
            {StatusIcon && (
              <StatusIcon
                className={cn(
                  "h-3.5 w-3.5 flex-shrink-0",
                  step.status === "completed" && "text-emerald-500",
                  step.status === "active" && "text-violet-500 animate-spin",
                  step.status === "pending" && "text-muted-foreground/40",
                  step.status === "error" && "text-red-500",
                )}
              />
            )}
            {/* Duration / Elapsed */}
            {step.status === "active" ? (
              <span className="text-[11px] text-violet-500 tabular-nums flex-shrink-0 animate-pulse">
                {elapsed}s
              </span>
            ) : step.duration ? (
              <span className="text-[11px] text-muted-foreground/50 tabular-nums flex-shrink-0">
                {step.duration < 1000
                  ? `${step.duration}ms`
                  : `${(step.duration / 1000).toFixed(1)}s`}
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                "h-3 w-3 text-muted-foreground/40 transition-transform duration-200 flex-shrink-0 ml-auto opacity-0 group-hover/header:opacity-100",
                expanded && "rotate-180",
              )}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const parts = [`[${config.label}] ${step.title}`, "", step.content]
              if (step.metadata?.query) {
                parts.push("", `Query: ${step.metadata.query}`)
              }
              if (step.metadata?.url) {
                parts.push(`URL: ${step.metadata.url}`)
              }
              if (step.metadata?.results && step.metadata.results.length > 0) {
                parts.push("Results:")
                step.metadata.results.forEach((r) => parts.push(`- ${r}`))
              }
              navigator.clipboard.writeText(parts.join("\n"))
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted/60 transition-colors opacity-0 group-hover/header:opacity-100"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </button>
        </div>

        {/* Type label */}
        <span className={cn("text-[11px] font-medium uppercase tracking-wider", config.color)}>
          {config.label}
        </span>

        {/* Content preview (always shown) */}
        {!expanded && (
          <p className="text-[13px] text-muted-foreground/70 line-clamp-2 mt-0.5 leading-relaxed">
            {step.content}
          </p>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="mt-1.5 space-y-2">
            <p className="text-[13px] text-foreground/80 leading-relaxed">
              {step.content}
            </p>

            {/* Metadata */}
            {step.metadata?.query && (
              <div className="rounded-md bg-muted/50 border border-border/40 px-3 py-2">
                <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                  Query
                </span>
                <p className="text-xs font-mono text-foreground/70 mt-0.5">
                  {step.metadata.query}
                </p>
              </div>
            )}

            {step.metadata?.url && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Globe className="h-3 w-3" />
                <a
                  href={step.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {step.metadata.url}
                </a>
              </div>
            )}

            {step.metadata?.results && step.metadata.results.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                  Results
                </span>
                {step.metadata.results.map((result, i) => (
                  <p
                    key={i}
                    className="text-xs text-foreground/60 pl-3 border-l-2 border-border/40"
                  >
                    {result}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
