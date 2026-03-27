import { TREE_NAVIGATION, CATEGORY_GROUPS, CATEGORY_TREES } from "@/constants"
import type { CategoryGroup, TreeNavigationItem, ArtifactType } from "@/types"
import type { Session } from "@/types/sessions"

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

export function getBreadcrumbs(itemId: string, tree?: NavItem[]): BreadcrumbItem[] {
  const source = tree ?? (TREE_NAVIGATION as unknown as NavItem[])
  // Search main tree first
  const mainPath = findPath(itemId, source, [])
  if (mainPath) return mainPath
  // Fall back to category trees
  for (const [categoryId, items] of Object.entries(CATEGORY_TREES)) {
    const catPath = findPath(itemId, items as unknown as NavItem[], [])
    if (catPath) return catPath
  }
  return [{ id: itemId, title: itemId }]
}

export function getNavItem(itemId: string, tree?: NavItem[]): NavItem | null {
  const source = tree ?? (TREE_NAVIGATION as unknown as NavItem[])
  // Search main tree first
  const mainResult = findItem(itemId, source)
  if (mainResult) return mainResult
  // Fall back to category trees
  for (const items of Object.values(CATEGORY_TREES)) {
    const found = findItem(itemId, items as unknown as NavItem[])
    if (found) return found
  }
  return null
}

export function getNavChildren(itemId: string, tree?: NavItem[]): NavItem[] {
  return getNavItem(itemId, tree)?.children ?? []
}

export function isNavFolder(itemId: string, tree?: NavItem[]): boolean {
  return getNavItem(itemId, tree)?.type === "folder"
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
export function getLeafDescendants(itemId: string, tree?: NavItem[]): LeafDescendant[] {
  const item = getNavItem(itemId, tree)
  if (!item?.children) return []
  return collectLeaves(item.children, [])
}

/** Returns all ancestor folder IDs for a given item (from root to parent). */
export function getAncestorIds(itemId: string, tree?: NavItem[]): string[] {
  const source = tree ?? (TREE_NAVIGATION as unknown as NavItem[])
  // Search main tree first
  const path = findPath(itemId, source, [])
  if (path) return path.slice(0, -1).map((p) => p.id)
  // Fall back to category trees
  for (const items of Object.values(CATEGORY_TREES)) {
    const catPath = findPath(itemId, items as unknown as NavItem[], [])
    if (catPath) return catPath.slice(0, -1).map((p) => p.id)
  }
  return []
}

/** Filter tree to only items matching the given IDs. */
export function getTreeItemsByIds(itemIds: string[], tree?: NavItem[]): NavItem[] {
  const source = tree ?? (TREE_NAVIGATION as unknown as NavItem[])
  const idSet = new Set(itemIds)
  return source.filter(item => idSet.has(item.id))
}

/** Find which category group contains a given nav item (by direct membership or ancestry). */
export function getCategoryForNavItem(navItemId: string, tree?: NavItem[]): string | null {
  // 1. Direct membership in navItemIds
  for (const group of CATEGORY_GROUPS) {
    if (group.navItemIds.includes(navItemId)) return group.id
  }
  // 2. Ancestor chain check
  const ancestors = getAncestorIds(navItemId, tree)
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

// ── Artifact type utilities ──────────────────────────────────────────────

export const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  dashboard: "Dashboards",
  report: "Reports",
  connection: "Connections",
  query: "Data Tables",
  recipe: "Recipes",
  chat: "Chats",
  settings: "Admin",
}

/** Collect all leaf items recursively with their artifactType */
function collectLeafItems(items: readonly NavItem[]): NavItem[] {
  const result: NavItem[] = []
  for (const item of items) {
    if (SKIP_TYPES.has(item.type)) continue
    if (item.type === "folder" && item.children) {
      result.push(...collectLeafItems(item.children))
    } else if (item.type === "file") {
      result.push(item)
    }
  }
  return result
}

export interface ArtifactTypeInfo {
  type: string
  label: string
  count: number
}

/** Get distinct artifact types and counts for leaf items in a folder */
export function getArtifactTypesInFolder(folderId: string, tree?: NavItem[]): ArtifactTypeInfo[] {
  const folder = getNavItem(folderId, tree)
  if (!folder?.children) return []
  const leaves = collectLeafItems(folder.children)
  const counts = new Map<string, number>()
  for (const leaf of leaves) {
    const t = leaf.artifactType ?? "generic"
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({
      type,
      label: ARTIFACT_TYPE_LABELS[type] ?? type,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

/** Get all descendant item IDs for a folder (for session scoping) */
export function getAllDescendantIds(folderId: string, tree?: NavItem[]): Set<string> {
  const folder = getNavItem(folderId, tree)
  if (!folder?.children) return new Set()
  const ids = new Set<string>()
  const walk = (items: readonly NavItem[]) => {
    for (const item of items) {
      ids.add(item.id)
      if (item.children) walk(item.children)
    }
  }
  walk(folder.children)
  return ids
}

/** Filter sessions to those related to items in the current scope */
export function getSessionsInScope(sessions: Session[], activeNavItem: string, tree?: NavItem[]): Session[] {
  const folder = getNavItem(activeNavItem, tree)

  // Folder scope: filter to sessions related to any descendant
  if (folder?.type === "folder") {
    const descendantIds = getAllDescendantIds(activeNavItem, tree)
    return sessions.filter(s =>
      s.relatedItems.some(ri => descendantIds.has(ri.id)) ||
      s.relatedArtifacts.some(id => descendantIds.has(id))
    )
  }

  // Item scope: filter to sessions related to this specific item
  if (folder?.type === "file") {
    return sessions.filter(s =>
      s.relatedItems.some(ri => ri.id === activeNavItem) ||
      s.relatedArtifacts.includes(activeNavItem)
    )
  }

  // No scope (welcome, AI agent, etc.): return all sessions
  return sessions
}
