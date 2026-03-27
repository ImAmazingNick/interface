"use client"

import { useState, useMemo, useCallback } from "react"
import type { FilterColumnConfig, FilterState } from "@/types/filters"
import type { ActiveFilter } from "@/components/shared/active-filter-bar"

interface UseFilterableDataOptions<T> {
  data: T[]
  columns: FilterColumnConfig<T>[]
  searchTerm?: string
  searchKeys?: (keyof T)[]
  searchFn?: (item: T, term: string) => boolean
}

interface UseFilterableDataReturn<T> {
  filteredData: T[]
  filters: FilterState
  toggleFilterValue: (key: string, value: string) => void
  clearFilter: (key: string) => void
  clearAllFilters: () => void
  availableValues: Record<string, string[]>
  activeFilters: ActiveFilter[]
  hasActiveFilters: boolean
}

function getItemValues<T>(item: T, col: FilterColumnConfig<T>): string[] {
  if (col.accessor) {
    const result = col.accessor(item)
    if (result == null) return []
    return Array.isArray(result) ? result.filter(Boolean) : result ? [result] : []
  }
  const raw = item[col.key as keyof T]
  if (raw == null) return []
  const str = String(raw)
  return str ? [str] : []
}

export function useFilterableData<T>({
  data,
  columns,
  searchTerm,
  searchKeys,
  searchFn,
}: UseFilterableDataOptions<T>): UseFilterableDataReturn<T> {
  const [filters, setFilters] = useState<FilterState>({})

  const columnMap = useMemo(
    () => new Map(columns.map((c) => [c.key, c])),
    [columns]
  )

  const toggleFilterValue = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      const current = new Set(prev[key] ?? [])
      if (current.has(value)) {
        current.delete(value)
      } else {
        current.add(value)
      }
      if (current.size === 0) {
        delete next[key]
      } else {
        next[key] = current
      }
      return next
    })
  }, [])

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Unique values per column from the full (unfiltered) dataset
  const availableValues = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const col of columns) {
      const values = new Set<string>()
      for (const item of data) {
        for (const v of getItemValues(item, col)) {
          values.add(v)
        }
      }
      result[col.key] = Array.from(values).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      )
    }
    return result
  }, [data, columns])

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Text search
      if (searchTerm) {
        if (searchFn) {
          if (!searchFn(item, searchTerm)) return false
        } else if (searchKeys && searchKeys.length > 0) {
          const q = searchTerm.toLowerCase()
          const matchesSearch = searchKeys.some((key) => {
            const val = item[key]
            return val != null && String(val).toLowerCase().includes(q)
          })
          if (!matchesSearch) return false
        }
      }

      // Column filters: AND across columns, OR within a column
      for (const [key, selected] of Object.entries(filters)) {
        if (selected.size === 0) continue
        const col = columnMap.get(key)
        if (!col) continue
        const itemValues = getItemValues(item, col)
        const hasMatch = itemValues.some((v) => selected.has(v))
        if (!hasMatch) return false
      }

      return true
    })
  }, [data, filters, searchTerm, searchKeys, searchFn, columnMap])

  // Build ActiveFilter[] for the filter bar
  const activeFilters = useMemo((): ActiveFilter[] => {
    const result: ActiveFilter[] = []
    for (const col of columns) {
      const selected = filters[col.key]
      if (!selected?.size) continue
      for (const value of selected) {
        const displayValue = col.formatValue?.(value) ?? value
        result.push({
          key: `${col.key}:${value}`,
          label: `${col.label}: ${displayValue}`,
          onRemove: () => toggleFilterValue(col.key, value),
        })
      }
    }
    return result
  }, [columns, filters, toggleFilterValue])

  const hasActiveFilters = activeFilters.length > 0 || !!searchTerm

  return {
    filteredData,
    filters,
    toggleFilterValue,
    clearFilter,
    clearAllFilters,
    availableValues,
    activeFilters,
    hasActiveFilters,
  }
}
