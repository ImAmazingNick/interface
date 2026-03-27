"use client"

import { useState, useCallback, useRef } from "react"
import { TREE_NAVIGATION } from "@/constants"
import { FolderOpen } from "lucide-react"
import type { TreeNavigationItem } from "@/types"

export interface UseNavigationTreeReturn {
  readonly tree: TreeNavigationItem[]
  readonly createFolder: (parentId: string, title: string) => string
  readonly renameItem: (itemId: string, newTitle: string) => void
  readonly deleteItem: (itemId: string) => void
  readonly getDeletedItem: () => { item: TreeNavigationItem; parentId: string | null; index: number } | null
  readonly restoreDeletedItem: () => void
}

/** Find the parent ID and index of an item in the tree */
function findItemLocation(
  itemId: string,
  items: TreeNavigationItem[],
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === itemId) return { parentId, index: i }
    if (items[i].children) {
      const result = findItemLocation(itemId, items[i].children!, items[i].id)
      if (result) return result
    }
  }
  return null
}

/** Recursively map tree items, applying a transform function */
function mapTree(
  items: TreeNavigationItem[],
  fn: (item: TreeNavigationItem) => TreeNavigationItem
): TreeNavigationItem[] {
  return items.map(item => {
    const mapped = fn(item)
    if (mapped.children) {
      return { ...mapped, children: mapTree(mapped.children, fn) }
    }
    return mapped
  })
}

/** Insert a child into a specific parent folder */
function insertChild(
  items: TreeNavigationItem[],
  parentId: string,
  child: TreeNavigationItem,
  index: number = 0
): TreeNavigationItem[] {
  return items.map(item => {
    if (item.id === parentId) {
      const children = [...(item.children ?? [])]
      children.splice(index, 0, child)
      return { ...item, children }
    }
    if (item.children) {
      return { ...item, children: insertChild(item.children, parentId, child, index) }
    }
    return item
  })
}

/** Remove an item from the tree by ID */
function filterTree(
  items: TreeNavigationItem[],
  itemId: string
): TreeNavigationItem[] {
  return items.reduce<TreeNavigationItem[]>((acc, item) => {
    if (item.id === itemId) return acc
    if (item.children) {
      acc.push({ ...item, children: filterTree(item.children, itemId) })
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}

/** Find an item by ID in the tree */
function findItem(itemId: string, items: TreeNavigationItem[]): TreeNavigationItem | null {
  for (const item of items) {
    if (item.id === itemId) return item
    if (item.children) {
      const found = findItem(itemId, item.children)
      if (found) return found
    }
  }
  return null
}

export function useNavigationTree(): UseNavigationTreeReturn {
  const [tree, setTree] = useState<TreeNavigationItem[]>(
    () => TREE_NAVIGATION as unknown as TreeNavigationItem[]
  )

  // Store last deleted item for undo
  const lastDeletedRef = useRef<{
    item: TreeNavigationItem
    parentId: string | null
    index: number
  } | null>(null)

  const createFolder = useCallback((parentId: string, title: string): string => {
    const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const folder: TreeNavigationItem = {
      id,
      title,
      icon: FolderOpen,
      type: "folder",
      children: [],
      expanded: true,
      status: "private",
    }
    setTree(prev => insertChild(prev, parentId, folder, 0))
    return id
  }, [])

  const renameItem = useCallback((itemId: string, newTitle: string) => {
    setTree(prev => mapTree(prev, item =>
      item.id === itemId ? { ...item, title: newTitle } : item
    ))
  }, [])

  const deleteItem = useCallback((itemId: string) => {
    setTree(prev => {
      // Find item and its location before deleting
      const item = findItem(itemId, prev)
      const location = findItemLocation(itemId, prev)
      if (item && location) {
        lastDeletedRef.current = {
          item,
          parentId: location.parentId,
          index: location.index,
        }
      }
      return filterTree(prev, itemId)
    })
  }, [])

  const getDeletedItem = useCallback(() => {
    return lastDeletedRef.current
  }, [])

  const restoreDeletedItem = useCallback(() => {
    const deleted = lastDeletedRef.current
    if (!deleted) return

    if (deleted.parentId === null) {
      // Restore at root level
      setTree(prev => {
        const next = [...prev]
        next.splice(Math.min(deleted.index, next.length), 0, deleted.item)
        return next
      })
    } else {
      setTree(prev => insertChild(prev, deleted.parentId!, deleted.item, deleted.index))
    }
    lastDeletedRef.current = null
  }, [])

  return { tree, createFolder, renameItem, deleteItem, getDeletedItem, restoreDeletedItem }
}
