import { TREE_NAVIGATION, CATEGORY_GROUPS, CATEGORY_TREES } from "@/constants"
import type { CategoryGroup, TreeNavigationItem } from "@/types"

export interface BreadcrumbItem {
  id: string
  title: string
}

export type NavItem = TreeNavigationItem

const SKIP_TYPES = new Set(["section", "search", "more"])

function findPath(
  itemId: string,
  items: readonly NavItem[],
  path: BreadcrumbItem[]
): BreadcrumbItem[] | null {
  for (const item of items) {
    if (SKIP_TYPES.has(item.type)) continue
    const next = [...path, { id: item.id, title: item.title }]
    if (item.id === itemId) return next
    if (item.children) {
      const result = findPath(itemId, item.children, next)
      if (result) return result
    }
  }
  return null
}

function findItem(itemId: string, items: readonly NavItem[]): NavItem | null {
  for (const item of items) {
    if (item.id === itemId) return item
    if (item.children) {
      const found = findItem(itemId, item.children)
      if (found) return found
    }
  }
  return null
}

export function getBreadcrumbs(itemId: string): BreadcrumbItem[] {
  // Search main tree first
  const mainPath = findPath(itemId, TREE_NAVIGATION as unknown as NavItem[], [])
  if (mainPath) return mainPath
  // Fall back to category trees
  for (const [categoryId, items] of Object.entries(CATEGORY_TREES)) {
    const catPath = findPath(itemId, items as unknown as NavItem[], [])
    if (catPath) return catPath
  }
  return [{ id: itemId, title: itemId }]
}

export function getNavItem(itemId: string): NavItem | null {
  // Search main tree first
  const mainResult = findItem(itemId, TREE_NAVIGATION as unknown as NavItem[])
  if (mainResult) return mainResult
  // Fall back to category trees
  for (const items of Object.values(CATEGORY_TREES)) {
    const found = findItem(itemId, items as unknown as NavItem[])
    if (found) return found
  }
  return null
}

export function getNavChildren(itemId: string): NavItem[] {
  return getNavItem(itemId)?.children ?? []
}

export function isNavFolder(itemId: string): boolean {
  return getNavItem(itemId)?.type === "folder"
}

export interface LeafDescendant {
  id: string
  title: string
  type: string
  path: string
  children?: NavItem[]
}

function collectLeaves(items: readonly NavItem[], pathParts: string[]): LeafDescendant[] {
  const leaves: LeafDescendant[] = []
  for (const item of items) {
    if (SKIP_TYPES.has(item.type)) continue
    if (item.type === "folder" && item.children) {
      leaves.push(...collectLeaves(item.children, [...pathParts, item.title]))
    } else if (item.type !== "folder") {
      leaves.push({
        id: item.id,
        title: item.title,
        type: item.type,
        path: pathParts.join(" / "),
        children: item.children,
      })
    }
  }
  return leaves
}

/** Recursively collects all leaf (non-folder) descendants of a folder, with path labels. */
export function getLeafDescendants(itemId: string): LeafDescendant[] {
  const item = getNavItem(itemId)
  if (!item?.children) return []
  return collectLeaves(item.children, [])
}

/** Returns all ancestor folder IDs for a given item (from root to parent). */
export function getAncestorIds(itemId: string): string[] {
  // Search main tree first
  const path = findPath(itemId, TREE_NAVIGATION as unknown as NavItem[], [])
  if (path) return path.slice(0, -1).map((p) => p.id)
  // Fall back to category trees
  for (const items of Object.values(CATEGORY_TREES)) {
    const catPath = findPath(itemId, items as unknown as NavItem[], [])
    if (catPath) return catPath.slice(0, -1).map((p) => p.id)
  }
  return []
}

/** Filter TREE_NAVIGATION to only items matching the given IDs. */
export function getTreeItemsByIds(itemIds: string[]): NavItem[] {
  const idSet = new Set(itemIds)
  return (TREE_NAVIGATION as unknown as NavItem[]).filter(item => idSet.has(item.id))
}

/** Find which category group contains a given nav item (by direct membership or ancestry). */
export function getCategoryForNavItem(navItemId: string): string | null {
  // 1. Direct membership in navItemIds
  for (const group of CATEGORY_GROUPS) {
    if (group.navItemIds.includes(navItemId)) return group.id
  }
  // 2. Ancestor chain check
  const ancestors = getAncestorIds(navItemId)
  for (const group of CATEGORY_GROUPS) {
    for (const rootId of group.navItemIds) {
      if (ancestors.includes(rootId)) return group.id
    }
  }
  // 3. Direct search in CATEGORY_TREES
  for (const [categoryId, items] of Object.entries(CATEGORY_TREES)) {
    if (findItem(navItemId, items as unknown as NavItem[])) return categoryId
  }
  return null
}
