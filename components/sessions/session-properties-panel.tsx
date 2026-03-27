"use client"

import { X, Play, Brain, MessageSquare, Calendar, Clock, Cpu, LinkIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Session, SessionStatus, ThoughtStepType } from "@/types/sessions"

interface SessionPropertiesPanelProps {
  session: Session
  onClose: () => void
  onOpenSession?: () => void
  onChangeStatus?: (id: string, status: SessionStatus) => void
  onNavigateToItem?: (itemId: string) => void
}

const STATUS_STYLES: Record<SessionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  completed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  paused: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
}

const STEP_TYPE_LABELS: Record<ThoughtStepType, string> = {
  thinking: "Thinking",
  web_search: "Web Search",
  browsing: "Browsing",
  tool_use: "Tool Use",
  conclusion: "Conclusion",
  query: "Query",
  artifact: "Artifact",
}

const STEP_TYPE_COLORS: Record<ThoughtStepType, string> = {
  thinking: "text-violet-600 dark:text-violet-400",
  web_search: "text-blue-600 dark:text-blue-400",
  browsing: "text-cyan-600 dark:text-cyan-400",
  tool_use: "text-orange-600 dark:text-orange-400",
  conclusion: "text-emerald-600 dark:text-emerald-400",
  query: "text-amber-600 dark:text-amber-400",
  artifact: "text-primary",
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function SessionPropertiesPanel({
  session,
  onClose,
  onOpenSession,
  onChangeStatus,
  onNavigateToItem,
}: SessionPropertiesPanelProps) {
  const completedSteps = session.thoughtSteps.filter((s) => s.status === "completed").length
  const totalDuration = session.thoughtSteps.reduce((sum, s) => sum + (s.duration ?? 0), 0)

  // Group steps by type for summary
  const stepsByType = session.thoughtSteps.reduce(
    (acc, step) => {
      acc[step.type] = (acc[step.type] || 0) + 1
      return acc
    },
    {} as Record<ThoughtStepType, number>,
  )

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-5 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-foreground truncate flex-1 mr-2">
          Properties
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0"
          aria-label="Close properties panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-5">
          {/* Title & Status */}
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">
              {session.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {onChangeStatus ? (
                <Select
                  value={session.status}
                  onValueChange={(v) => onChangeStatus(session.id, v as SessionStatus)}
                >
                  <SelectTrigger className="h-7 w-auto text-[11px] capitalize gap-1 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="paused" className="text-xs">Paused</SelectItem>
                    <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                    <SelectItem value="error" className="text-xs">Error</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant="outline"
                  className={cn("text-[11px] capitalize", STATUS_STYLES[session.status])}
                >
                  {session.status}
                </Badge>
              )}
              {session.agentModel && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Cpu className="h-3 w-3" />
                  {session.agentModel === "think" ? "Think" : "Fast"}
                </span>
              )}
            </div>
          </div>

          {/* Open Session button — shown when viewing from table, hidden when already inside session */}
          {onOpenSession && (
            <Button
              onClick={onOpenSession}
              className="w-full gap-2"
              size="sm"
            >
              <Play className="h-3.5 w-3.5" />
              Open Session
            </Button>
          )}

          {/* Metadata grid */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              Details
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <span className="text-muted-foreground/60 text-xs">Created</span>
                <span className="text-xs text-foreground ml-auto tabular-nums">
                  {formatDate(session.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <span className="text-muted-foreground/60 text-xs">Updated</span>
                <span className="text-xs text-foreground ml-auto tabular-nums">
                  {formatDate(session.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <span className="text-muted-foreground/60 text-xs">Messages</span>
                <span className="text-xs text-foreground ml-auto tabular-nums">
                  {session.messages.length}
                </span>
              </div>
            </div>
          </div>

          {/* Thought Steps Summary */}
          {session.thoughtSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Thought Steps
              </h4>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-foreground">
                      {completedSteps}/{session.thoughtSteps.length} completed
                    </span>
                  </div>
                  {totalDuration > 0 && (
                    <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                      {formatDuration(totalDuration)}
                    </span>
                  )}
                </div>
                {/* Step type breakdown */}
                <div className="space-y-1">
                  {(Object.entries(stepsByType) as [ThoughtStepType, number][]).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between py-0.5"
                      >
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            STEP_TYPE_COLORS[type],
                          )}
                        >
                          {STEP_TYPE_LABELS[type]}
                        </span>
                        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Items */}
          {session.relatedItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Related Items
              </h4>
              <div className="space-y-1.5">
                {session.relatedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigateToItem?.(item.id)}
                    className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 bg-muted/30 border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-colors cursor-pointer text-left group/item"
                  >
                    <LinkIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">
                      {item.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover/item:text-muted-foreground/60 transition-colors flex-shrink-0" />
                    {item.type && (
                      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider flex-shrink-0">
                        {item.type}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Last message preview */}
          {session.messages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Last Message
              </h4>
              <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2.5">
                <span className="text-[11px] text-muted-foreground/50 capitalize">
                  {session.messages[session.messages.length - 1].role}
                </span>
                <p className="text-xs text-foreground/70 mt-1 line-clamp-4 leading-relaxed">
                  {session.messages[session.messages.length - 1].content}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
