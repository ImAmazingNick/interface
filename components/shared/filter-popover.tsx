"use client"

import { useState, useMemo } from "react"
import { ListFilter, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { FilterColumnConfig, FilterState } from "@/types/filters"

interface FilterPopoverProps<T> {
  columns: FilterColumnConfig<T>[]
  filters: FilterState
  availableValues: Record<string, string[]>
  onToggleValue: (key: string, value: string) => void
  onClearFilter: (key: string) => void
}

export function FilterPopover<T>({
  columns,
  filters,
  availableValues,
  onToggleValue,
  onClearFilter,
}: FilterPopoverProps<T>) {
  const [open, setOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)

  const activeColumn = useMemo(
    () => columns.find((c) => c.key === selectedColumn),
    [columns, selectedColumn]
  )

  const totalActiveCount = useMemo(() => {
    let count = 0
    for (const selected of Object.values(filters)) {
      count += selected.size
    }
    return count
  }, [filters])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      // Reset to column picker on close
      setTimeout(() => setSelectedColumn(null), 150)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm px-2.5">
          <ListFilter className="h-3.5 w-3.5" />
          Filter
          {totalActiveCount > 0 && (
            <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {totalActiveCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        {!selectedColumn ? (
          // Step 1: Column picker
          <Command>
            <CommandInput placeholder="Filter by..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                {columns.map((col) => {
                  const activeCount = filters[col.key]?.size ?? 0
                  return (
                    <CommandItem
                      key={col.key}
                      onSelect={() => setSelectedColumn(col.key)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {col.icon && <col.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span>{col.label}</span>
                      </div>
                      {activeCount > 0 && (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                          {activeCount}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          // Step 2: Value selector
          <Command>
            <div className="flex items-center border-b border-border px-2 py-1.5">
              <button
                type="button"
                onClick={() => setSelectedColumn(null)}
                className="mr-1.5 p-0.5 rounded-sm hover:bg-muted transition-colors cursor-pointer"
                aria-label="Back to columns"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <span className="text-xs font-medium text-foreground">{activeColumn?.label}</span>
              {(filters[selectedColumn]?.size ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => onClearFilter(selectedColumn)}
                  className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <CommandInput placeholder={`Search ${activeColumn?.label?.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No values found.</CommandEmpty>
              <CommandGroup>
                {(availableValues[selectedColumn] ?? []).map((value) => {
                  const isSelected = filters[selectedColumn]?.has(value) ?? false
                  const displayValue = activeColumn?.formatValue?.(value) ?? value
                  return (
                    <CommandItem
                      key={value}
                      onSelect={() => onToggleValue(selectedColumn, value)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{displayValue}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
