"use client"

import { useState, useMemo, useCallback } from "react"

export type SortDirection = "asc" | "desc" | null

export interface SortConfig {
  key: string
  direction: SortDirection
}

function compareValues(aVal: unknown, bVal: unknown, direction: "asc" | "desc"): number {
  // Nullish and empty values sort last regardless of direction
  const aEmpty = aVal == null || aVal === ""
  const bEmpty = bVal == null || bVal === ""
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1

  let result: number
  if (typeof aVal === "number" && typeof bVal === "number") {
    result = aVal - bVal
  } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
    result = Number(aVal) - Number(bVal)
  } else {
    result = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" })
  }

  return direction === "desc" ? -result : result
}

export function useSortableData<T>(data: T[], defaultSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    defaultSort ?? { key: "", direction: null }
  )

  const requestSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" }
      }
      // Cycle: asc → desc → null
      const next: SortDirection =
        prev.direction === "asc" ? "desc" : prev.direction === "desc" ? null : "asc"
      return { key, direction: next }
    })
  }, [])

  const clearSort = useCallback(() => {
    setSortConfig({ key: "", direction: null })
  }, [])

  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return data

    return [...data].sort((a, b) => {
      // Folders always sort above files
      const aFolder = (a as Record<string, unknown>).isFolder
      const bFolder = (b as Record<string, unknown>).isFolder
      if (aFolder && !bFolder) return -1
      if (!aFolder && bFolder) return 1

      const aVal = a[sortConfig.key as keyof T]
      const bVal = b[sortConfig.key as keyof T]
      return compareValues(aVal, bVal, sortConfig.direction!)
    })
  }, [data, sortConfig])

  return { sortedData, sortConfig, requestSort, clearSort }
}
