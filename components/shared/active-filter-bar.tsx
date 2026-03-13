"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ActiveFilter {
  key: string
  label: string
  onRemove: () => void
}

interface ActiveFilterBarProps {
  filters: ActiveFilter[]
  onClearAll: () => void
}

export function ActiveFilterBar({ filters, onClearAll }: ActiveFilterBarProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-border/40 bg-muted/20">
      <span className="text-xs text-muted-foreground shrink-0">Filters:</span>
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {filters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className="text-xs py-0.5 px-2 gap-1 shrink-0"
          >
            {filter.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                filter.onRemove()
              }}
              className="ml-0.5 rounded-sm hover:bg-foreground/10 p-0.5 transition-colors cursor-pointer"
              aria-label={`Remove filter: ${filter.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto shrink-0 cursor-pointer"
      >
        Clear all
      </button>
    </div>
  )
}
