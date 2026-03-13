"use client"

import type React from "react"
import { memo, useCallback, useRef, useState, useMemo, useEffect, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WORKSPACES, CATEGORY_GROUPS, CATEGORY_TREES } from "@/constants"
import { getCategoryForNavItem } from "@/lib/navigation"
import type { MainNavigationProps } from "@/types"
import {
  ChevronDown, ChevronRight, FolderOpen, Folder, Plus,
  Search, ChevronsUpDown, ChevronsDownUp, ListTree, X,
  Settings, Users, Bot, Bell, User, LogOut,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

// Collect all folder IDs from a tree (for expand/collapse all)
function collectFolderIds(items: any[]): string[] {
  const ids: string[] = []
  for (const item of items) {
    if (item.type === "folder") {
      ids.push(item.id)
      if (item.children) ids.push(...collectFolderIds(item.children))
    }
  }
  return ids
}

// ─── Highlighted search text ───

const HighlightedText = memo(function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const lower = text.toLowerCase()
  const qLower = query.toLowerCase()
  const idx = lower.indexOf(qLower)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-orange-200/70 text-inherit rounded-[2px] px-[1px]">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
})

// ─── Tree item renderer ───

const CategoryTreeItem = memo(function CategoryTreeItem({
  item,
  level = 0,
  isFirst = false,
  onSelect,
  onToggleExpand,
  onPlusClick,
  currentActiveItem,
  expandedIds,
  searchQuery = "",
}: {
  item: any
  level?: number
  isFirst?: boolean
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onPlusClick?: (id: string) => void
  currentActiveItem?: string
  expandedIds: Set<string>
  searchQuery?: string
}) {
  const Icon = item.icon
  const isFolder = item.type === "folder"
  const isSection = item.type === "section"
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedIds.has(item.id)
  const isActive = currentActiveItem === item.id

  const handleClick = useCallback(() => {
    if (isSection) return
    if (isFolder && hasChildren) {
      onToggleExpand(item.id)
      onSelect(item.id)
      return
    }
    onSelect(item.id)
  }, [item.id, isSection, isFolder, hasChildren, onSelect, onToggleExpand])

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isFolder && hasChildren) onToggleExpand(item.id)
    },
    [item.id, isFolder, hasChildren, onToggleExpand],
  )

  const handlePlusClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onPlusClick) onPlusClick(item.id)
    },
    [item.id, onPlusClick],
  )

  if (isSection) {
    return (
      <div className={cn("px-3 py-1", !isFirst && "mt-4")}>
        <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider border-b border-sidebar-border/50 pb-0.5">
          <span><HighlightedText text={item.title} query={searchQuery} /></span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-9 text-left font-medium rounded-lg transition-all duration-200 group relative cursor-pointer",
          isActive
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
          level > 0 && "ml-2",
        )}
        onClick={handleClick}
        style={{
          paddingLeft: `${level * 10 + 8}px`,
          backgroundColor: isActive ? "color-mix(in oklab, lab(72 2 3) 15%, transparent)" : undefined,
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "color-mix(in oklab, lab(72 2 3) 15%, transparent)"
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = ""
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 relative">
          {isFolder && hasChildren && (
            <span
              role="button"
              tabIndex={0}
              className="flex items-center justify-center w-4 h-4 -ml-1 cursor-pointer hover:bg-sidebar-accent/50 rounded-sm transition-colors duration-150"
              onClick={handleChevronClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleChevronClick(e as unknown as React.MouseEvent)
                }
              }}
              aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-orange-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-3 w-3 text-orange-600" aria-hidden="true" />
              )}
            </span>
          )}

          {isFolder ? (
            <div className="relative">
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-orange-500" />
              ) : (
                <Folder className="h-4 w-4 text-orange-600" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-4 h-4">
              {Icon && <Icon className="h-3.5 w-3.5 text-sidebar-foreground/70" />}
            </div>
          )}

          <span className="truncate text-sm">
            <HighlightedText text={item.title} query={searchQuery} />
          </span>

          {isFolder && hasChildren && (
            <span
              role="button"
              tabIndex={0}
              className="absolute -right-1 opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-200 scale-75 group-hover:scale-100 cursor-pointer"
              onClick={handlePlusClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handlePlusClick(e as unknown as React.MouseEvent)
                }
              }}
              aria-label={`Add new item to ${item.title}`}
            >
              <Plus className="h-7 w-7 text-orange-500 hover:text-orange-400" aria-hidden="true" />
            </span>
          )}
        </div>
      </Button>

      {isFolder && hasChildren && isExpanded && (
        <div className="ml-1 border-l border-sidebar-border/50">
          {item.children.map((child: any, idx: number) => (
            <CategoryTreeItem
              key={`${child.id}-${idx}`}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onPlusClick={onPlusClick}
              currentActiveItem={currentActiveItem}
              expandedIds={expandedIds}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
})

// ─── CategoryStrip ───

const CategoryStripButton = memo(function CategoryStripButton({
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
        "w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg transition-all duration-200 cursor-pointer",
        isActive
          ? "text-sidebar-foreground"
          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/15",
      )}
      onClick={onClick}
      title={group.label}
    >
      <div
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
            : "text-inherit",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className={cn(
        "text-[10px] leading-tight text-center w-full transition-all duration-200",
        isActive ? "font-semibold text-primary" : "font-medium",
      )}>{group.label}</span>
    </button>
  )
})

const CategoryWorkspaceSelector = memo(function CategoryWorkspaceSelector() {
  const [currentWorkspace] = useState("business")
  const workspace = WORKSPACES.find((ws) => ws.id === currentWorkspace) || WORKSPACES[0]
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-8 h-8 p-0 text-xs font-medium"
      aria-label={workspace.name}
    >
      {workspace.name.charAt(0).toUpperCase()}
    </Button>
  )
})

const CATEGORY_USER_POPOVER_ITEMS = [
  { type: "label" as const, label: "Organization" },
  { id: "general", label: "General", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "ai-agent", label: "AI Agent", icon: Bot },
  { type: "separator" as const },
  { type: "label" as const, label: "Account" },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "user-settings", label: "User settings", icon: User },
  { type: "separator" as const },
  { id: "logout", label: "Log out", icon: LogOut },
]

const CategoryUserProfile = memo(function CategoryUserProfile() {
  return (
    <div className="border-t border-sidebar-border/50 p-3">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex justify-center w-full rounded-lg p-1 -m-1 transition-colors hover:bg-sidebar-accent/30 cursor-pointer"
            title="John Doe"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center ring-1 ring-sidebar-border/20">
              <span className="text-xs font-semibold text-primary-foreground">JD</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" className="w-56 p-1.5">
          {CATEGORY_USER_POPOVER_ITEMS.map((item, idx) => {
            if (item.type === "separator") return <Separator key={`sep-${idx}`} className="my-1" />
            if (item.type === "label") return (
              <p key={item.label} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{item.label}</p>
            )
            const Icon = item.icon!
            return (
              <button
                key={item.id}
                className={cn(
                  "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.id === "logout" && "text-destructive hover:text-destructive"
                )}
                onClick={() => console.log("Navigate to:", item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </PopoverContent>
      </Popover>
    </div>
  )
})

// ─── CategoryTreePanel ───

const CategoryTreePanel = forwardRef<HTMLInputElement, {
  categoryLabel: string
  items: any[]
  activeItem: string
  onItemSelect: (id: string) => void
  onPlusClick?: (id: string) => void
  onToggleExpand: (id: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  expandedIds: Set<string>
  searchQuery: string
  onSearchChange: (query: string) => void
  width: number
}>(function CategoryTreePanel({
  categoryLabel,
  items,
  activeItem,
  onItemSelect,
  onPlusClick,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  expandedIds,
  searchQuery,
  onSearchChange,
  width,
}, ref) {
  return (
    <div
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
      style={{ width }}
    >
      {/* Header with label and controls */}
      <div className="px-3 py-2.5 border-b border-sidebar-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-sidebar-foreground">{categoryLabel}</span>
          <div className="flex items-center gap-0.5">
            <button
              className="w-6 h-6 flex items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
              onClick={onExpandAll}
              title="Expand all"
              aria-label="Expand all items"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
              onClick={onCollapseAll}
              title="Collapse all"
              aria-label="Collapse all items"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
          <input
            ref={ref}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={`Search ${categoryLabel}`}
            className="w-full h-7 pl-7 pr-7 text-xs bg-sidebar-accent/20 border border-sidebar-border/50 rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-sidebar-accent/30"
          />
          {searchQuery ? (
            <button
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-sm text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-medium text-sidebar-foreground/30 bg-sidebar-accent/40 border border-sidebar-border/40 rounded px-1 py-0.5 leading-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 pr-2 py-3 space-y-0.5 overflow-y-auto overscroll-contain touch-manipulation">
        {items.map((item: any, idx: number) => (
          <CategoryTreeItem
            key={`${item.id}-${idx}`}
            item={item}
            isFirst={idx === 0}
            onSelect={onItemSelect}
            onToggleExpand={onToggleExpand}
            onPlusClick={onPlusClick}
            currentActiveItem={activeItem}
            expandedIds={expandedIds}
            searchQuery={searchQuery}
          />
        ))}
        {items.length === 0 && searchQuery && (
          <div className="px-2 py-8 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-sidebar-foreground/15" />
            <p className="text-sm text-sidebar-foreground/50">
              No results for &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => onSearchChange("")}
              className="text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/60 mt-1.5 cursor-pointer transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </nav>
    </div>
  )
})

// ─── Search filtering helper ───

function filterTreeItems(items: any[], query: string): any[] {
  if (!query) return items
  const lq = query.toLowerCase()
  const result: any[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    // Sections: only keep if at least one non-section item in this section matches
    if (item.type === "section") {
      let hasMatchBelow = false
      for (let j = i + 1; j < items.length; j++) {
        if (items[j].type === "section") break // stop at next section boundary
        if (itemMatchesQuery(items[j], lq)) {
          hasMatchBelow = true
          break
        }
      }
      if (hasMatchBelow) result.push(item)
      continue
    }
    if (item.title?.toLowerCase().includes(lq)) {
      result.push(item)
      continue
    }
    if (item.children) {
      const filteredChildren = filterTreeItems(item.children, query)
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren })
      }
    }
  }
  return result
}

function itemMatchesQuery(item: any, lq: string): boolean {
  if (item.title?.toLowerCase().includes(lq)) return true
  if (item.children) return item.children.some((c: any) => itemMatchesQuery(c, lq))
  return false
}

// Collect folder IDs from filtered tree (for auto-expanding during search)
function collectAllFolderIds(items: any[]): string[] {
  const ids: string[] = []
  for (const item of items) {
    if (item.type === "folder") {
      ids.push(item.id)
      if (item.children) ids.push(...collectAllFolderIds(item.children))
    }
  }
  return ids
}

// ─── CategoryNavigation (main container) ───

export const CategoryNavigation = memo(function CategoryNavigation({
  activeItem,
  onItemSelect,
  onPlusClick,
  sidebarWidth = 240,
  onWidthChange,
  onModeToggle,
}: MainNavigationProps & { onPlusClick?: (id: string) => void; onModeToggle?: () => void }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    return getCategoryForNavItem(activeItem)
  })
  // Per-category expanded state
  const [expandedByCategory, setExpandedByCategory] = useState<Record<string, Set<string>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number; didDrag: boolean } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const preSearchExpandedRef = useRef<Set<string> | null>(null)

  // Derive current category's expanded set
  const expandedIds = useMemo(
    () => expandedByCategory[activeCategory ?? ""] ?? new Set<string>(),
    [expandedByCategory, activeCategory],
  )

  const derivedCategory = useMemo(() => getCategoryForNavItem(activeItem), [activeItem])

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory((prev) => {
      if (prev === categoryId) return null
      setSearchQuery("")
      preSearchExpandedRef.current = null
      return categoryId
    })
    // Navigate to the category's root nav item so the right side updates
    const group = CATEGORY_GROUPS.find((g) => g.id === categoryId)
    if (group?.navItemIds?.[0]) {
      onItemSelect(group.navItemIds[0])
    }
  }, [onItemSelect])

  const handleToggleExpand = useCallback((itemId: string) => {
    if (!activeCategory) return
    setExpandedByCategory((prev) => {
      const catSet = new Set(prev[activeCategory] ?? [])
      if (catSet.has(itemId)) catSet.delete(itemId)
      else catSet.add(itemId)
      return { ...prev, [activeCategory]: catSet }
    })
  }, [activeCategory])

  const handleExpandAll = useCallback(() => {
    if (!activeCategory || !CATEGORY_TREES[activeCategory]) return
    const allIds = collectFolderIds(CATEGORY_TREES[activeCategory])
    setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: new Set(allIds) }))
  }, [activeCategory])

  const handleCollapseAll = useCallback(() => {
    if (!activeCategory) return
    setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: new Set() }))
  }, [activeCategory])

  // Strip "recent-" prefix from IDs so content routing uses canonical IDs
  const handleItemSelect = useCallback((id: string) => {
    const canonicalId = id.startsWith("recent-") ? id.slice("recent-".length) : id
    onItemSelect(canonicalId)
  }, [onItemSelect])

  // Get tree items for active category, with search filtering
  const filteredItems = useMemo(() => {
    if (!activeCategory) return []
    const tree = CATEGORY_TREES[activeCategory]
    if (!tree) return []
    if (!searchQuery) return tree
    return filterTreeItems(tree, searchQuery)
  }, [activeCategory, searchQuery])

  // Auto-expand folders in filtered results so matches are visible
  useEffect(() => {
    if (!searchQuery || !activeCategory || filteredItems.length === 0) return
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
    if (!activeCategory) return
    if (searchQuery && !preSearchExpandedRef.current) {
      // Snapshot current state before search modifies it
      preSearchExpandedRef.current = new Set(expandedByCategory[activeCategory] ?? [])
    }
    if (!searchQuery && preSearchExpandedRef.current) {
      // Restore pre-search state
      const restored = preSearchExpandedRef.current
      setExpandedByCategory((prev) => ({ ...prev, [activeCategory]: restored }))
      preSearchExpandedRef.current = null
    }
  }, [searchQuery, activeCategory])

  // Keyboard shortcuts: Cmd+K to focus search, Escape to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (!activeCategory) {
          const cat = derivedCategory ?? CATEGORY_GROUPS[0]?.id
          if (cat) setActiveCategory(cat)
          setTimeout(() => searchInputRef.current?.focus(), 100)
        } else {
          searchInputRef.current?.focus()
        }
      }
      if (e.key === "Escape" && searchQuery) {
        e.preventDefault()
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchQuery, activeCategory, derivedCategory])

  const activeCategoryLabel = useMemo(() => {
    return CATEGORY_GROUPS.find((g) => g.id === activeCategory)?.label ?? ""
  }, [activeCategory])

  // Resize handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = sidebarWidth
      dragRef.current = { startX, startWidth, didDrag: false }
      setIsDragging(true)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return
        const dx = moveEvent.clientX - dragRef.current.startX
        if (Math.abs(dx) > 3) dragRef.current.didDrag = true
        const newWidth = Math.max(160, Math.min(320, dragRef.current.startWidth + dx))
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

  const isPanelOpen = activeCategory !== null

  return (
    <div className="h-screen flex relative">
      {/* Category Strip */}
      <div className="h-screen w-20 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-2 pt-4 pb-2 flex flex-col items-center gap-2 border-b border-sidebar-border/50">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-primary-foreground">CF</span>
            </div>
            {onModeToggle && (
              <button
                className="absolute -right-1.5 -top-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-sidebar border border-sidebar-border/50 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors cursor-pointer"
                onClick={onModeToggle}
                title="Switch to tree view"
              >
                <ListTree className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
          <CategoryWorkspaceSelector />
        </div>

        <div className="flex-1 py-3 px-1.5 space-y-1 overflow-y-auto">
          {CATEGORY_GROUPS.map((group) => (
            <CategoryStripButton
              key={group.id}
              group={group}
              isActive={activeCategory === group.id || (activeCategory === null && derivedCategory === group.id)}
              onClick={() => handleCategoryClick(group.id)}
            />
          ))}
        </div>

        <CategoryUserProfile />
      </div>

      {/* Tree Panel */}
      {isPanelOpen && (
        <>
          <div
            className={cn(
              "flex-shrink-0",
              !isDragging && "transition-all duration-200",
            )}
          >
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
              width={sidebarWidth}
            />
          </div>

          <div
            className="w-5 cursor-col-resize group relative z-10 flex-shrink-0"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-sidebar-accent/12 via-sidebar-accent/6 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out" />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border group-hover:bg-sidebar-accent/70 transition-all duration-300" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full" />
              <div className="w-1 h-1 bg-sidebar-foreground/50 rounded-full" />
              <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full" />
            </div>
          </div>
        </>
      )}
    </div>
  )
})
