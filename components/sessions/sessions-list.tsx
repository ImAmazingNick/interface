"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Plus, MessageSquare, Brain, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/shared/search-input"
import { FilterPopover } from "@/components/shared/filter-popover"
import { ActiveFilterBar } from "@/components/shared/active-filter-bar"
import { SortableTableHead } from "@/components/shared/sortable-table-head"
import { useFilterableData } from "@/hooks/use-filterable-data"
import { useSortableData } from "@/hooks/use-sortable-data"
import { cn } from "@/lib/utils"
import type { Session, SessionStatus } from "@/types/sessions"
import type { FilterColumnConfig } from "@/types/filters"

interface SessionsListProps {
  sessions: Session[]
  activeSessionId?: string
  isCompact?: boolean
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  onDeleteSession?: (id: string) => void
  onDuplicateSession?: (id: string) => void
  onRenameSession?: (id: string, newTitle: string) => void
  scopeName?: string
  totalSessionCount?: number
  onShowAllSessions?: () => void
}

const STATUS_STYLES: Record<SessionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  completed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  paused: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
}

const FILTER_COLUMNS: FilterColumnConfig<Session>[] = [
  {
    key: "status",
    label: "Status",
    formatValue: (v) => v.charAt(0).toUpperCase() + v.slice(1),
  },
  {
    key: "agentModel",
    label: "Model",
    accessor: (s) => s.agentModel ?? "unknown",
    formatValue: (v) => (v === "think" ? "Think" : v === "fast" ? "Fast" : v),
  },
  {
    key: "relatedType",
    label: "Related Type",
    accessor: (s) => s.relatedItems.map((r) => r.type ?? "item"),
    formatValue: (v) => v.charAt(0).toUpperCase() + v.slice(1),
  },
]

const STATUS_ROW_TINTS: Record<SessionStatus, string> = {
  active: "bg-emerald-50/40 dark:bg-emerald-950/10",
  completed: "",
  paused: "",
  error: "bg-red-50/30 dark:bg-red-950/10",
}

function sessionSearchFn(session: Session, term: string): boolean {
  const q = term.toLowerCase()
  if (session.title.toLowerCase().includes(q)) return true
  if (session.messages.some((m) => m.content.toLowerCase().includes(q))) return true
  if (session.thoughtSteps.some((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))) return true
  return false
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: diffDays > 365 ? "numeric" : undefined })
}

export function SessionsList({
  sessions,
  activeSessionId,
  isCompact,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onDuplicateSession,
  onRenameSession,
  scopeName,
  totalSessionCount,
  onShowAllSessions,
}: SessionsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)
  const [renameTarget, setRenameTarget] = useState<Session | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus rename input when dialog opens
  useEffect(() => {
    if (renameTarget) {
      setTimeout(() => renameInputRef.current?.select(), 0)
    }
  }, [renameTarget])

  const {
    filteredData: filtered,
    filters,
    toggleFilterValue,
    clearFilter,
    clearAllFilters,
    availableValues,
    activeFilters,
    hasActiveFilters,
  } = useFilterableData({
    data: sessions,
    columns: FILTER_COLUMNS,
    searchTerm,
    searchFn: sessionSearchFn,
  })

  const { sortedData, sortConfig, requestSort } = useSortableData(filtered, {
    key: "updatedAt",
    direction: "desc",
  })

  const displaySessions = sortedData

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <div className="h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-foreground">Sessions</h1>
            <span className="text-xs text-muted-foreground/70 tabular-nums">
              {displaySessions.length}
              {hasActiveFilters && sessions.length !== displaySessions.length && (
                <span className="text-muted-foreground/40"> / {sessions.length}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search sessions…"
              className="w-48"
              inputClassName="h-8 text-sm"
            />
            <FilterPopover
              columns={FILTER_COLUMNS}
              filters={filters}
              availableValues={availableValues}
              onToggleValue={toggleFilterValue}
              onClearFilter={clearFilter}
            />
            <Button
              size="sm"
              onClick={onCreateSession}
              className="h-8 gap-1.5 text-sm px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              New Session
            </Button>
          </div>
        </div>
        <ActiveFilterBar filters={activeFilters} onClearAll={clearAllFilters} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {displaySessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableTableHead
                  label="Title"
                  sortKey="title"
                  currentSortKey={sortConfig.key}
                  currentDirection={sortConfig.direction}
                  onSort={requestSort}
                  className="pl-6"
                />
                <SortableTableHead
                  label="Status"
                  sortKey="status"
                  currentSortKey={sortConfig.key}
                  currentDirection={sortConfig.direction}
                  onSort={requestSort}
                  className="w-[110px]"
                />
                {!isCompact && (
                  <>
                    <SortableTableHead
                      label="Model"
                      sortKey="agentModel"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[90px]"
                    />
                    <SortableTableHead
                      label="Steps"
                      sortKey="thoughtSteps"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[80px]"
                    />
                    <SortableTableHead
                      label="Related"
                      sortKey="relatedItems"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[180px]"
                    />
                  </>
                )}
                <SortableTableHead
                  label="Updated"
                  sortKey="updatedAt"
                  currentSortKey={sortConfig.key}
                  currentDirection={sortConfig.direction}
                  onSort={requestSort}
                  className="w-[100px]"
                />
                <TableHead className="w-[44px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySessions.map((session) => {
                const isActive = session.id === activeSessionId
                return (
                <TableRow
                  key={session.id}
                  className={cn(
                    "cursor-pointer transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-inset",
                    isActive && "border-l-2 border-l-violet-500",
                    !isActive && STATUS_ROW_TINTS[session.status],
                  )}
                  data-state={isActive ? "selected" : undefined}
                  onClick={() => onSelectSession(session.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onSelectSession(session.id)
                    }
                  }}
                  aria-label={`Open session: ${session.title}`}
                >
                  {/* Title */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          session.status === "active"
                            ? "text-emerald-500"
                            : session.status === "completed"
                              ? "text-blue-500"
                              : "text-muted-foreground/40",
                        )}
                      />
                      <span className="text-sm font-medium text-foreground truncate">
                        {session.title}
                      </span>
                    </div>
                  </TableCell>
                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] capitalize",
                        STATUS_STYLES[session.status],
                      )}
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  {!isCompact && (
                    <>
                      {/* Model */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {session.agentModel === "think" ? "Think" : session.agentModel === "fast" ? "Fast" : "\u2014"}
                        </span>
                      </TableCell>
                      {/* Steps */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Brain className="h-3 w-3 text-violet-500/50" />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {session.thoughtSteps.length}
                          </span>
                        </div>
                      </TableCell>
                      {/* Related */}
                      <TableCell>
                        <div className="flex items-center gap-1 min-w-0">
                          {session.relatedItems.slice(0, 2).map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 truncate max-w-[120px]"
                            >
                              {item.title}
                            </span>
                          ))}
                          {session.relatedItems.length > 2 && (
                            <span className="text-[11px] text-muted-foreground/50">
                              +{session.relatedItems.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                  {/* Updated */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground/60 tabular-nums">
                      {formatRelativeTime(session.updatedAt)}
                    </span>
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <Popover
                      open={deleteTarget?.id === session.id || renameTarget?.id === session.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setDeleteTarget(null)
                          setRenameTarget(null)
                        }
                      }}
                    >
                      <PopoverAnchor asChild>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setRenameTarget(session)
                                  setRenameValue(session.title)
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDuplicateSession?.(session.id)
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget(session)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </PopoverAnchor>
                      <PopoverContent
                        align="end"
                        side="bottom"
                        className="w-64"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deleteTarget?.id === session.id && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium">Delete session</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                This will permanently delete &ldquo;{session.title}&rdquo;.
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDeleteTarget(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  onDeleteSession?.(session.id)
                                  setDeleteTarget(null)
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                        {renameTarget?.id === session.id && (
                          <form
                            className="space-y-3"
                            onSubmit={(e) => {
                              e.preventDefault()
                              if (renameValue.trim()) {
                                onRenameSession?.(session.id, renameValue.trim())
                                setRenameTarget(null)
                              }
                            }}
                          >
                            <div>
                              <p className="text-sm font-medium mb-2">Rename session</p>
                              <Input
                                ref={renameTarget?.id === session.id ? renameInputRef : undefined}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                placeholder="Session title"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs" type="button" onClick={() => setRenameTarget(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" className="h-7 text-xs" type="submit" disabled={!renameValue.trim()}>
                                Rename
                              </Button>
                            </div>
                          </form>
                        )}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : sessions.length === 0 && totalSessionCount != null && totalSessionCount > 0 ? (
          /* Scoped empty state — sessions exist globally but none match this scope */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-11 h-11 bg-muted/60 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No sessions related to {scopeName ? `items in ${scopeName}` : "this view"}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Sessions linked to items in this folder will appear here
            </p>
            {onShowAllSessions && (
              <Button variant="outline" size="sm" onClick={onShowAllSessions} className="gap-1.5">
                Show all sessions
              </Button>
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-11 h-11 bg-muted/60 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No sessions yet</p>
            <p className="text-xs text-muted-foreground mb-5">
              Start a new session to work with the AI agent
            </p>
            <Button size="sm" onClick={onCreateSession} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Session
            </Button>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions match your filters
            </p>
            <button
              onClick={() => {
                clearAllFilters()
                setSearchTerm("")
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
