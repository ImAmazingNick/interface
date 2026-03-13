"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SortDirection } from "@/hooks/use-sortable-data"

interface SortableTableHeadProps {
  label: string
  sortKey: string
  currentSortKey: string
  currentDirection: SortDirection
  onSort: (key: string) => void
  className?: string
}

export function SortableTableHead({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSortKey === sortKey && currentDirection !== null
  const direction = isActive ? currentDirection : null

  const ariaSortValue = direction === "asc"
    ? "ascending" as const
    : direction === "desc"
      ? "descending" as const
      : "none" as const

  return (
    <TableHead
      className={cn("group h-10 px-4", className)}
      aria-sort={ariaSortValue}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1.5 w-full text-left cursor-pointer select-none text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {label}
        {direction === "asc" ? (
          <ArrowUp className="h-3 w-3 text-foreground shrink-0" />
        ) : direction === "desc" ? (
          <ArrowDown className="h-3 w-3 text-foreground shrink-0" />
        ) : (
          <ArrowUpDown className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
        )}
      </button>
    </TableHead>
  )
}
