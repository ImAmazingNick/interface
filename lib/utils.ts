import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}

export function filterDataSources<T extends { name: string; category: string; connected?: boolean }>(
  sources: T[],
  activeCategory: string,
  searchQuery: string
): T[] {
  let filtered = sources

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(
      (source) =>
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Filter by category
  if (activeCategory && activeCategory !== "all") {
    if (activeCategory === "connected") {
      filtered = filtered.filter((source) => source.connected === true)
    } else {
      filtered = filtered.filter((source) => source.category === activeCategory)
    }
  }

  return filtered
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}
