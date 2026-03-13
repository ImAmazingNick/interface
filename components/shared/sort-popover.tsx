"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { SortConfig } from "@/hooks/use-sortable-data"

export interface SortColumn {
  key: string
  label: string
}

interface SortPopoverProps {
  columns: SortColumn[]
  sortConfig: SortConfig
  onSort: (key: string) => void
}

export function SortPopover({ columns, sortConfig, onSort }: SortPopoverProps) {
  const [open, setOpen] = useState(false)

  const activeColumn = columns.find((c) => c.key === sortConfig.key)
  const hasActiveSort = !!sortConfig.direction && !!activeColumn

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm px-2.5">
          {hasActiveSort ? (
            sortConfig.direction === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5" />
          )}
          {hasActiveSort ? activeColumn.label : "Sort"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        <div className="flex flex-col">
          {columns.map((col) => {
            const isActive = sortConfig.key === col.key && sortConfig.direction
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => {
                  onSort(col.key)
                }}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors cursor-pointer"
              >
                <span className={isActive ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {col.label}
                </span>
                {isActive && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    {sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
