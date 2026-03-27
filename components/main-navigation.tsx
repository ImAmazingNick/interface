"use client"

import type React from "react"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TREE_NAVIGATION, WORKSPACES } from "@/constants"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { MainNavigationProps } from "@/types"
import { GripVertical, ChevronDown, ChevronRight, FolderOpen, Folder, File, FileText, Plus, Search, X, Lock, Users2, Building2, Settings, Users, Bot, Bell, User, LogOut } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  onSelect,
  isCollapsed,
}: {
  item: { id: string; title: string; icon: React.ComponentType<{ className?: string }> }
  isActive: boolean
  onSelect: (id: string) => void
  isCollapsed: boolean
}) {
  const Icon = item.icon

  const handleClick = useCallback(() => {
    onSelect(item.id)
  }, [item.id, onSelect])

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        isCollapsed && "justify-center px-0",
      )}
      onClick={handleClick}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">{item.title}</span>}
    </Button>
  )
})

const WorkspaceSelector = memo(function WorkspaceSelector({ isCollapsed }: { isCollapsed: boolean }) {
  const [currentWorkspace, setCurrentWorkspace] = useState("business")

  const handleWorkspaceSelect = useCallback((workspaceId: string) => {
    // TODO: Implement workspace switching logic
    console.log('Switching to workspace:', workspaceId)
    setCurrentWorkspace(workspaceId)
  }, [])

  if (isCollapsed) {
    const workspace = WORKSPACES.find(ws => ws.id === currentWorkspace) || WORKSPACES[0]
    return (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-xs font-medium"
          aria-label={workspace.name}
        >
          {workspace.name.charAt(0).toUpperCase()}
        </Button>
      </div>
    )
  }

  return (
    <Select value={currentWorkspace} onValueChange={handleWorkspaceSelect}>
      <SelectTrigger className="w-full h-9 px-3 cursor-pointer">
        <SelectValue>
          {(() => {
            const workspace = WORKSPACES.find(ws => ws.id === currentWorkspace) || WORKSPACES[0]
            return (
              <div className="flex items-center gap-2">
                <span className="font-medium">{workspace.name}</span>
              </div>
            )
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {WORKSPACES.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{workspace.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

function filterTreeItems(items: any[], query: string): any[] {
  if (!query.trim()) return items
  const lower = query.toLowerCase()
  const result: any[] = []
  for (const item of items) {
    if (item.type === 'search' || item.type === 'more' || item.type === 'section') continue
    if (item.type === 'folder' && item.children?.length > 0) {
      const filteredChildren = filterTreeItems(item.children, query)
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren, expanded: true })
      } else if (item.title.toLowerCase().includes(lower)) {
        result.push({ ...item, expanded: true })
      }
    } else if (item.title.toLowerCase().includes(lower)) {
      result.push(item)
    }
  }
  return result
}

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

const TreeNavigationItem = memo(function TreeNavigationItem({
  item,
  level = 0,
  isActive,
  onSelect,
  onToggleExpand,
  onPlusClick,
  isCollapsed,
  currentActiveItem,
  searchQuery = "",
}: {
  item: any
  level?: number
  isActive: boolean
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onPlusClick?: (id: string) => void
  isCollapsed: boolean
  currentActiveItem?: string
  searchQuery?: string
}) {
  const Icon = item.icon
  const isFolder = item.type === 'folder'
  const isSection = item.type === 'section'
  const isSearch = item.type === 'search'
  const isMore = item.type === 'more'
  const hasChildren = item.children && item.children.length > 0

  const handleClick = useCallback(() => {
    // Section headers are not clickable
    if (isSection) {
      return
    }

    // For folders: also expand if not yet expanded
    if (isFolder && hasChildren && !item.expanded) {
      onToggleExpand(item.id)
    }

    // Always navigate when clicking folders or files
    onSelect(item.id)
  }, [item.id, isSection, isFolder, hasChildren, item.expanded, onSelect, onToggleExpand])

  const handleChevronClick = useCallback((e: React.MouseEvent) => {
    // Prevent event bubbling to avoid navigation
    e.stopPropagation()
    // Only toggle expansion for folders with children
    if (isFolder && hasChildren) {
      onToggleExpand(item.id)
    }
  }, [item.id, isFolder, hasChildren, onToggleExpand])

  const handlePlusClick = useCallback((e: React.MouseEvent) => {
    // Prevent event bubbling to avoid navigation
    e.stopPropagation()
    // Call the plus click handler if provided
    if (onPlusClick) {
      onPlusClick(item.id)
    }
  }, [item.id, onPlusClick])

  if (isCollapsed) {
    if (isSection) {
      return (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            {/* Icon removed for section headers */}
          </div>
        </div>
      )
    }

    if (isMore) {
      return (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-center h-8 text-left font-medium rounded-md transition-all duration-200 group cursor-pointer",
            "text-sidebar-foreground/60 hover:bg-gray-100/60 hover:text-sidebar-foreground/80",
            level > 0 && "ml-1"
          )}
          onClick={handleClick}
          title={item.title}
        >
          <span className="text-xs">{item.title}</span>
        </Button>
      )
    }

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-center h-10 text-left font-medium rounded-lg transition-all duration-200 group cursor-pointer relative",
          currentActiveItem === item.id
            ? "text-sidebar-foreground"
            : isSearch
            ? "text-sidebar-foreground/50 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/80"
            : "text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
          level > 0 && "ml-1"
        )}
        onClick={handleClick}
        title={item.title}
        style={{
          backgroundColor: currentActiveItem === item.id ? 'color-mix(in oklab, lab(72 2 3) 15%, transparent)' : undefined,
        }}
        onMouseEnter={(e) => {
          if (currentActiveItem !== item.id) {
            e.currentTarget.style.backgroundColor = 'color-mix(in oklab, lab(72 2 3) 15%, transparent)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentActiveItem !== item.id) {
            e.currentTarget.style.backgroundColor = '';
          }
        }}
      >
        {isFolder ? (
          <div className="relative">
            {item.expanded ? (
              <FolderOpen className="h-4 w-4 text-orange-500" />
            ) : (
              <Folder className="h-4 w-4 text-orange-600" />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-4 h-4">
            <Icon className="h-3.5 w-3.5 text-sidebar-foreground/70" />
          </div>
        )}

        {/* + Icon on hover for folders - positioned on the right side in collapsed view */}
        {isFolder && hasChildren && (
          <span
            role="button"
            tabIndex={0}
            className="absolute -right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,transform] duration-200 scale-75 group-hover:scale-100 focus-visible:scale-100 cursor-pointer"
            onClick={handlePlusClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlusClick(e as unknown as React.MouseEvent); } }}
            aria-label={`Add new item to ${item.title}`}
          >
            <Plus className="h-7 w-7 text-orange-500 hover:text-orange-400" aria-hidden="true" />
          </span>
        )}
      </Button>
    )
  }

  if (isSection) {
    return (
      <div className={cn("px-3 py-1", item.id === "data-pipelines-section" || item.id === "latest-section" || item.id === "analytics-section" ? "mt-4" : "")}>
        <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider border-b border-sidebar-border/50 pb-0.5">
          {/* Icon removed for section headers */}
          <span>{item.title}</span>
        </div>
      </div>
    )
  }

  if (isMore) {
    return (
      <div className="px-3 py-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-8 text-left font-medium rounded-md transition-all duration-200 group cursor-pointer",
            "text-sidebar-foreground/60 hover:bg-gray-100/60 hover:text-sidebar-foreground/80",
            level > 0 && "ml-2"
          )}
          onClick={handleClick}
          style={{ paddingLeft: `${(level * 10) + 8}px` }}
        >
          <span className="text-sm">{item.title}</span>
        </Button>
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
            : isSearch
            ? "text-sidebar-foreground/50 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/80"
            : "text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
          level > 0 && "ml-2"
        )}
        onClick={handleClick}
        style={{
          paddingLeft: `${(level * 10) + 8}px`,
          backgroundColor: isActive ? 'color-mix(in oklab, lab(72 2 3) 15%, transparent)' : undefined,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'color-mix(in oklab, lab(72 2 3) 15%, transparent)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '';
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 relative">
          {/* Folder/File Icon — for folders with children, chevron replaces icon on hover */}
          {isFolder && hasChildren ? (
            <span
              role="button"
              tabIndex={0}
              className="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:bg-sidebar-accent/50 rounded-sm transition-colors duration-150"
              onClick={handleChevronClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleChevronClick(e as unknown as React.MouseEvent); } }}
              aria-label={item.expanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
            >
              {/* Folder icon — hidden on hover */}
              <span className="group-hover:opacity-0 transition-opacity duration-150">
                {item.expanded ? (
                  <FolderOpen className="h-4 w-4 text-orange-500" aria-hidden="true" />
                ) : (
                  <Folder className="h-4 w-4 text-orange-600" aria-hidden="true" />
                )}
              </span>
              {/* Chevron — shown on hover, replaces folder icon */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {item.expanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />
                )}
              </span>
            </span>
          ) : isFolder ? (
            <div className="relative flex items-center justify-center w-4 h-4">
              {item.expanded ? (
                <FolderOpen className="h-4 w-4 text-orange-500" />
              ) : (
                <Folder className="h-4 w-4 text-orange-600" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-4 h-4">
              <Icon className="h-3.5 w-3.5 text-sidebar-foreground/70" />
            </div>
          )}

          {/* Title */}
          <span className="truncate text-sm">
            <HighlightedText text={item.title} query={searchQuery} />
          </span>

          {/* Private/Shared indicator */}
          {item.status === "private" && (
            <Lock className="h-3 w-3 text-sidebar-foreground/25 shrink-0 ml-auto group-hover:opacity-0 transition-opacity duration-150" aria-label="Private" />
          )}
          {item.status === "shared" && (
            <span className="shrink-0 ml-auto flex items-center gap-1 group-hover:opacity-0 transition-opacity duration-150" aria-label="Shared">
              <Users2 className="h-3 w-3 text-emerald-500/60" />
              {item.sharedWith && item.sharedWith.length > 0 && (
                <span className="text-[10px] text-emerald-600/50 tabular-nums">{item.sharedWith.length}</span>
              )}
            </span>
          )}

          {/* + Icon on hover for folders - positioned on the right side */}
          {isFolder && hasChildren && (
            <span
              role="button"
              tabIndex={0}
              className="absolute -right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,transform] duration-200 scale-75 group-hover:scale-100 focus-visible:scale-100 cursor-pointer"
              onClick={handlePlusClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlusClick(e as unknown as React.MouseEvent); } }}
              aria-label={`Add new item to ${item.title}`}
            >
              <Plus className="h-7 w-7 text-orange-500 hover:text-orange-400" aria-hidden="true" />
            </span>
          )}
        </div>
      </Button>

      {/* Children */}
      {isFolder && hasChildren && item.expanded && (
        <div className="ml-1 border-l border-sidebar-border/50">
          {item.children.map((child: any) => (
            <TreeNavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={currentActiveItem === child.id}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onPlusClick={onPlusClick}
              isCollapsed={isCollapsed}
              currentActiveItem={currentActiveItem}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
})

const USER_POPOVER_ITEMS = [
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

const UserProfile = memo(function UserProfile({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn("border-t border-sidebar-border/50", isCollapsed ? "p-3" : "p-4")}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 w-full rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-sidebar-accent/30 cursor-pointer",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "John Doe" : undefined}
          >
            <div className={cn(
              "rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center ring-1 ring-sidebar-border/20",
              isCollapsed ? "w-8 h-8" : "w-10 h-10"
            )}>
              <span className={cn(
                "font-semibold text-primary-foreground",
                isCollapsed ? "text-xs" : "text-sm"
              )}>JD</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">john@example.com</p>
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-56 p-1.5">
          {USER_POPOVER_ITEMS.map((item, idx) => {
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

// Compute default expanded folder IDs from TREE_NAVIGATION
function collectExpandedIds(items: readonly any[]): string[] {
  const ids: string[] = []
  for (const item of items) {
    if (item.expanded) ids.push(item.id)
    if (item.children) ids.push(...collectExpandedIds(item.children))
  }
  return ids
}
const DEFAULT_EXPANDED_IDS = collectExpandedIds(TREE_NAVIGATION)

export const MainNavigation = memo(function MainNavigation({
  activeItem,
  onItemSelect,
  onPlusClick,
  isCollapsed = false,
  onToggleCollapse,
  sidebarWidth = 256,
  onWidthChange,
}: MainNavigationProps & { onPlusClick?: (id: string) => void }) {
  // Persist expanded folder IDs across sessions
  const [expandedIds, setExpandedIds] = useLocalStorage<string[]>('nav-expanded-folders', DEFAULT_EXPANDED_IDS)

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds])

  const treeItems = useMemo(() => {
    const applyExpanded = (items: readonly any[]): any[] =>
      items.map(item => ({
        ...item,
        expanded: expandedSet.has(item.id),
        ...(item.children ? { children: applyExpanded(item.children) } : {}),
      }))
    return applyExpanded(TREE_NAVIGATION as unknown as any[])
  }, [expandedSet])

  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number; didDrag: boolean } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd+K to focus search, Escape to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isCollapsed && onToggleCollapse) onToggleCollapse()
        setTimeout(() => searchInputRef.current?.focus(), isCollapsed ? 300 : 0)
      }
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, isCollapsed, onToggleCollapse])

  // Filtered items for display
  const displayedItems = useMemo(() => {
    const itemsWithoutSearch = treeItems.filter((item: any) => item.type !== 'search')
    if (!searchQuery.trim()) return itemsWithoutSearch
    return filterTreeItems(itemsWithoutSearch as unknown as any[], searchQuery)
  }, [treeItems, searchQuery])

  const handleItemSelect = useCallback(
    (itemId: string) => {
      onItemSelect(itemId)
    },
    [onItemSelect],
  )

  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedIds(prev => {
      const set = new Set(prev)
      if (set.has(itemId)) set.delete(itemId)
      else set.add(itemId)
      return Array.from(set)
    })
  }, [setExpandedIds])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = isCollapsed ? 64 : sidebarWidth
    dragRef.current = { startX, startWidth, didDrag: false }
    setIsDragging(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return
      const dx = moveEvent.clientX - dragRef.current.startX
      if (Math.abs(dx) > 3) dragRef.current.didDrag = true
      const newWidth = Math.max(64, Math.min(480, dragRef.current.startWidth + dx))

      if (newWidth < 120) {
        // Below collapse threshold — snap to collapsed
        if (!isCollapsed && onToggleCollapse) onToggleCollapse()
      } else {
        // Above threshold — ensure expanded and set width
        if (isCollapsed && onToggleCollapse) onToggleCollapse()
        if (onWidthChange) onWidthChange(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [isCollapsed, sidebarWidth, onToggleCollapse, onWidthChange])

  const handleResizeClick = useCallback(() => {
    // Only toggle if user didn't drag
    if (dragRef.current?.didDrag) return
    if (onToggleCollapse) onToggleCollapse()
  }, [onToggleCollapse])

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col relative",
        !isDragging && "transition-all duration-300",
      )}
      style={{ width: isCollapsed ? 64 : sidebarWidth, minWidth: 64 }}
    >
      {/* Full-height Resize Handle */}
      {onToggleCollapse && (
        <div
          className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize transition-all duration-300 group z-10"
          onMouseDown={handleResizeMouseDown}
          onClick={handleResizeClick}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={() => {
            if (!isDragging) document.body.style.cursor = 'col-resize'
          }}
          onMouseLeave={() => {
            if (!isDragging) document.body.style.cursor = 'default'
          }}
        >
          {/* Elegant multi-layer hover background */}
          <div className="absolute inset-0 bg-gradient-to-l from-sidebar-accent/12 via-sidebar-accent/6 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-sidebar-accent/8 via-sidebar-accent/4 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-50"></div>

          {/* Animated border line with glow effect */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border group-hover:bg-sidebar-accent/70 transition-all duration-300 shadow-sm group-hover:shadow-[0_0_8px_rgba(var(--sidebar-accent),0.3)]"></div>

          {/* Subtle dots indicator */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full"></div>
            <div className="w-1 h-1 bg-sidebar-foreground/50 rounded-full"></div>
            <div className="w-1 h-1 bg-sidebar-foreground/30 rounded-full"></div>
          </div>
        </div>
      )}

      <div className={cn(
        "border-b border-sidebar-border transition-all duration-300",
        isCollapsed ? "p-4" : "p-6"
      )}>
        {/* Logo Section */}
        <div className={cn(
          "flex items-center mb-4",
          isCollapsed ? "mb-2 justify-center" : "mb-4"
        )}>
          <div className={cn(
            "rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg",
            isCollapsed ? "w-10 h-10" : "w-12 h-12"
          )}>
            <span className={cn(
              "font-bold text-primary-foreground",
              isCollapsed ? "text-sm" : "text-lg"
            )}>
              CF
            </span>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-heading font-bold text-sidebar-foreground">Core Flow</h1>
            </div>
          )}
        </div>

        {/* Workspace Selector */}
        <div className={cn(isCollapsed ? "flex justify-center" : "")}>
          <WorkspaceSelector isCollapsed={isCollapsed} />
        </div>
      </div>

      <nav className={cn("flex-1 py-4 space-y-0.5 overflow-y-auto overscroll-contain touch-manipulation", isCollapsed ? "px-2" : "px-3 pr-2")}>
        {/* Search Input */}
        {!isCollapsed ? (
          <div className="px-1 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-8 text-sm bg-sidebar-accent/20 border border-sidebar-border/40 rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-sidebar-accent/30 transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-medium text-sidebar-foreground/30 bg-sidebar-accent/40 border border-sidebar-border/40 rounded px-1 py-0.5 leading-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              onClick={() => {
                if (onToggleCollapse) onToggleCollapse()
                setTimeout(() => searchInputRef.current?.focus(), 300)
              }}
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Nav Items */}
        {displayedItems.map((item) => (
          <TreeNavigationItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onSelect={handleItemSelect}
            onToggleExpand={handleToggleExpand}
            onPlusClick={onPlusClick}
            isCollapsed={isCollapsed}
            currentActiveItem={activeItem}
            searchQuery={searchQuery}
          />
        ))}

        {/* Empty state */}
        {searchQuery && displayedItems.length === 0 && !isCollapsed && (
          <div className="px-2 py-8 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-sidebar-foreground/15" />
            <p className="text-sm text-sidebar-foreground/50">No results for &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
              className="text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/60 mt-1.5 cursor-pointer transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </nav>

      <div className={cn(isCollapsed ? "pr-2" : "pr-2")}>
        <UserProfile isCollapsed={isCollapsed} />
      </div>
    </div>
  )
})
