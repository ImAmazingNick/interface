"use client"

import type React from "react"
import { memo, useCallback, useRef, useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TAB_CATEGORY_GROUPS, CATEGORY_GROUPS, CATEGORY_TREES } from "@/constants"
import { getCategoryForNavItem } from "@/lib/navigation"
import type { MainNavigationProps } from "@/types"
import { NavModeSwitcher, type NavMode } from "@/components/nav-mode-switcher"
import {
  collectFolderIds,
  CategoryTreePanel,
  CategoryUserProfile,
  CategoryWorkspaceSelector,
  filterTreeItems,
  collectAllFolderIds,
} from "@/components/category-navigation"

// ─── TabButton ───

const TabButton = memo(function TabButton({
  group,
  isActive,
  onClick,
}: {
  group: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }
  isActive: boolean
  onClick: () => void
}) {
  const Icon = group.icon
  return (
    <button
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30",
      )}
      onClick={onClick}
      title={group.label}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{group.label}</span>
    </button>
  )
})

// ─── TabCategoryNavigation ───

export const TabCategoryNavigation = memo(function TabCategoryNavigation({
  activeItem,
  onItemSelect,
  onPlusClick,
  sidebarWidth = 280,
  onWidthChange,
  navMode,
  onModeChange,
}: MainNavigationProps & {
  onPlusClick?: (id: string) => void
  navMode: NavMode
  onModeChange: (mode: NavMode) => void
}) {
  // Map activeItem to the tab's treeKey
  const derivedTreeKey = useMemo(() => {
    const catId = getCategoryForNavItem(activeItem)
    const group = TAB_CATEGORY_GROUPS.find((g) => g.id === catId)
    return group?.treeKey ?? null
  }, [activeItem])

  const [activeTreeKey, setActiveTreeKey] = useState<string>(() => {
    return derivedTreeKey ?? TAB_CATEGORY_GROUPS[0]?.treeKey ?? "knowledge"
  })
  const [expandedByCategory, setExpandedByCategory] = useState<Record<string, Set<string>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number; didDrag: boolean } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const preSearchExpandedRef = useRef<Set<string> | null>(null)

  const expandedIds = useMemo(
    () => expandedByCategory[activeTreeKey] ?? new Set<string>(),
    [expandedByCategory, activeTreeKey],
  )

  const activeCategoryId = useMemo(() => {
    return TAB_CATEGORY_GROUPS.find((g) => g.treeKey === activeTreeKey)?.id ?? ""
  }, [activeTreeKey])

  const handleTabClick = useCallback((group: typeof TAB_CATEGORY_GROUPS[number]) => {
    setActiveTreeKey(group.treeKey)
    setSearchQuery("")
    preSearchExpandedRef.current = null
    // Navigate to the first navItemId from the matching CATEGORY_GROUP
    const catGroup = CATEGORY_GROUPS.find((g) => g.id === group.id)
    if (catGroup?.navItemIds?.[0]) {
      onItemSelect(catGroup.navItemIds[0])
    }
  }, [onItemSelect])

  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedByCategory((prev) => {
      const catSet = new Set(prev[activeTreeKey] ?? [])
      if (catSet.has(itemId)) catSet.delete(itemId)
      else catSet.add(itemId)
      return { ...prev, [activeTreeKey]: catSet }
    })
  }, [activeTreeKey])

  const handleExpandAll = useCallback(() => {
    if (!CATEGORY_TREES[activeTreeKey]) return
    const allIds = collectFolderIds(CATEGORY_TREES[activeTreeKey])
    setExpandedByCategory((prev) => ({ ...prev, [activeTreeKey]: new Set(allIds) }))
  }, [activeTreeKey])

  const handleCollapseAll = useCallback(() => {
    setExpandedByCategory((prev) => ({ ...prev, [activeTreeKey]: new Set() }))
  }, [activeTreeKey])

  const handleItemSelect = useCallback((id: string) => {
    const canonicalId = id.startsWith("recent-") ? id.slice("recent-".length) : id
    onItemSelect(canonicalId)
  }, [onItemSelect])

  const filteredItems = useMemo(() => {
    const tree = CATEGORY_TREES[activeTreeKey]
    if (!tree) return []
    if (!searchQuery) return tree
    return filterTreeItems(tree, searchQuery)
  }, [activeTreeKey, searchQuery])

  // Auto-expand folders in filtered results
  useEffect(() => {
    if (!searchQuery || filteredItems.length === 0) return
    const folderIds = collectAllFolderIds(filteredItems)
    if (folderIds.length > 0) {
      setExpandedByCategory((prev) => {
        const catSet = new Set(prev[activeTreeKey] ?? [])
        for (const id of folderIds) catSet.add(id)
        return { ...prev, [activeTreeKey]: catSet }
      })
    }
  }, [filteredItems, searchQuery, activeTreeKey])

  // Save/restore pre-search expansion state
  useEffect(() => {
    if (searchQuery && !preSearchExpandedRef.current) {
      preSearchExpandedRef.current = new Set(expandedByCategory[activeTreeKey] ?? [])
    }
    if (!searchQuery && preSearchExpandedRef.current) {
      const restored = preSearchExpandedRef.current
      setExpandedByCategory((prev) => ({ ...prev, [activeTreeKey]: restored }))
      preSearchExpandedRef.current = null
    }
  }, [searchQuery, activeTreeKey])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === "Escape" && searchQuery) {
        e.preventDefault()
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchQuery])

  const activeCategoryLabel = useMemo(() => {
    return TAB_CATEGORY_GROUPS.find((g) => g.treeKey === activeTreeKey)?.label ?? ""
  }, [activeTreeKey])

  // Resize handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = sidebarWidth ?? 280
      dragRef.current = { startX, startWidth, didDrag: false }
      setIsDragging(true)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return
        const dx = moveEvent.clientX - dragRef.current.startX
        if (Math.abs(dx) > 3) dragRef.current.didDrag = true
        const newWidth = Math.max(220, Math.min(400, dragRef.current.startWidth + dx))
        if (onWidthChange) onWidthChange(newWidth)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        dragRef.current = null
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [sidebarWidth, onWidthChange],
  )

  return (
    <div
      className={cn("h-screen flex flex-col relative bg-sidebar border-r border-sidebar-border", !isDragging && "transition-[width] duration-200")}
      style={{ width: sidebarWidth }}
    >
      {/* Header: logo + workspace + mode switcher */}
      <div className="flex items-center justify-between px-3 pt-3.5 pb-3 flex-shrink-0 border-b border-sidebar-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-bold text-primary-foreground">CF</span>
          </div>
          <CategoryWorkspaceSelector variant="inline" />
        </div>
        <NavModeSwitcher currentMode={navMode} onModeChange={onModeChange} />
      </div>

      {/* 3 horizontal tabs */}
      <div className="flex gap-1.5 px-3 py-2.5 flex-shrink-0">
        {TAB_CATEGORY_GROUPS.map((group) => (
          <TabButton
            key={group.id}
            group={group}
            isActive={activeCategoryId === group.id}
            onClick={() => handleTabClick(group)}
          />
        ))}
      </div>

      {/* Tree panel */}
      <div className="flex-1 overflow-hidden">
        <CategoryTreePanel
          ref={searchInputRef}
          categoryLabel={activeCategoryLabel}
          items={filteredItems}
          activeItem={activeItem}
          onItemSelect={handleItemSelect}
          onPlusClick={onPlusClick}
          onToggleExpand={handleToggleExpand}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          expandedIds={expandedIds}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          width="100%"
          className="h-full border-r-0"
        />
      </div>

      {/* User profile */}
      <CategoryUserProfile variant="full" />

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize group z-10 flex-shrink-0"
        style={{ transform: "translateX(50%)" }}
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-sidebar-accent/12 via-sidebar-accent/6 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-sidebar-border group-hover:bg-sidebar-accent/70 transition-all duration-300" />
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full" />
          <div className="w-1 h-1 bg-sidebar-foreground/50 rounded-full" />
          <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full" />
        </div>
      </div>
    </div>
  )
})
