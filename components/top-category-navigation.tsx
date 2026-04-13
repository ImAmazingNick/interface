"use client"

import type React from "react"
import { memo, useCallback, useRef, useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CATEGORY_GROUPS, CATEGORY_TREES } from "@/constants"
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

// ─── TopCategoryTab ───

const TopCategoryTab = memo(function TopCategoryTab({
  group,
  isActive,
  onClick,
  showLabel,
}: {
  group: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }
  isActive: boolean
  onClick: () => void
  showLabel: boolean
}) {
  const Icon = group.icon
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0",
        isActive
          ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/20",
      )}
      onClick={onClick}
      title={group.label}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      {showLabel && <span>{group.label}</span>}
    </button>
  )
})

// ─── TopCategoryNavigation ───

export const TopCategoryNavigation = memo(function TopCategoryNavigation({
  activeItem,
  onItemSelect,
  onPlusClick,
  sidebarWidth = 280,
  onWidthChange,
  navMode = "topCategory",
  onModeChange,
}: MainNavigationProps & { onPlusClick?: (id: string) => void; navMode?: NavMode; onModeChange?: (mode: NavMode) => void }) {
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return getCategoryForNavItem(activeItem) ?? CATEGORY_GROUPS[0]?.id ?? "ai-agent"
  })
  const [expandedByCategory, setExpandedByCategory] = useState<Record<string, Set<string>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number; didDrag: boolean } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const preSearchExpandedRef = useRef<Set<string> | null>(null)

  const expandedIds = useMemo(
    () => expandedByCategory[activeCategory] ?? new Set<string>(),
    [expandedByCategory, activeCategory],
  )

  const derivedCategory = useMemo(() => getCategoryForNavItem(activeItem), [activeItem])

  const showLabels = (sidebarWidth ?? 280) >= 260

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    setSearchQuery("")
    preSearchExpandedRef.current = null
    const group = CATEGORY_GROUPS.find((g) => g.id === categoryId)
    if (group?.navItemIds?.[0]) {
      onItemSelect(group.navItemIds[0])
    }
  }, [onItemSelect])

  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedByCategory((prev) => {
      const catSet = new Set(prev[activeCategory] ?? [])
      if (catSet.has(itemId)) catSet.delete(itemId)
      else catSet.add(itemId)
      return { ...prev, [activeCategory]: catSet }
    })
  }, [activeCategory])

  const handleExpandAll = useCallback(() => {
    if (!CATEGORY_TREES[activeCategory]) return
    const allIds = collectFolderIds(CATEGORY_TREES[activeCategory])
    setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: new Set(allIds) }))
  }, [activeCategory])

  const handleCollapseAll = useCallback(() => {
    setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: new Set() }))
  }, [activeCategory])

  const handleItemSelect = useCallback((id: string) => {
    const canonicalId = id.startsWith("recent-") ? id.slice("recent-".length) : id
    onItemSelect(canonicalId)
  }, [onItemSelect])

  const filteredItems = useMemo(() => {
    const tree = CATEGORY_TREES[activeCategory]
    if (!tree) return []
    if (!searchQuery) return tree
    return filterTreeItems(tree, searchQuery)
  }, [activeCategory, searchQuery])

  // Auto-expand folders in filtered results
  useEffect(() => {
    if (!searchQuery || filteredItems.length === 0) return
    const folderIds = collectAllFolderIds(filteredItems)
    if (folderIds.length > 0) {
      setExpandedByCategory((prev) => {
        const catSet = new Set(prev[activeCategory] ?? [])
        for (const id of folderIds) catSet.add(id)
        return { ...prev, [activeCategory]: catSet }
      })
    }
  }, [filteredItems, searchQuery, activeCategory])

  // Save/restore pre-search expansion state
  useEffect(() => {
    if (searchQuery && !preSearchExpandedRef.current) {
      preSearchExpandedRef.current = new Set(expandedByCategory[activeCategory] ?? [])
    }
    if (!searchQuery && preSearchExpandedRef.current) {
      const restored = preSearchExpandedRef.current
      setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: restored }))
      preSearchExpandedRef.current = null
    }
  }, [searchQuery, activeCategory])

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
    return CATEGORY_GROUPS.find((g) => g.id === activeCategory)?.label ?? ""
  }, [activeCategory])

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
        const newWidth = Math.max(200, Math.min(400, dragRef.current.startWidth + dx))
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
        {onModeChange && (
          <NavModeSwitcher currentMode={navMode} onModeChange={onModeChange} />
        )}
      </div>

      {/* Horizontal category tabs */}
      <div className="flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        {CATEGORY_GROUPS.map((group) => (
          <TopCategoryTab
            key={group.id}
            group={group}
            isActive={activeCategory === group.id || derivedCategory === group.id && activeCategory === group.id}
            onClick={() => handleCategoryClick(group.id)}
            showLabel={showLabels}
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
