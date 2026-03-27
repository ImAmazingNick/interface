"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TabConfig {
  key: string
  label: string
  count?: number
  icon?: LucideIcon
  separated?: boolean  // visual gap before this tab (e.g. Sessions separator)
}

interface CenterViewTabsProps {
  tabs: TabConfig[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function CenterViewTabs({ tabs, activeTab, onTabChange }: CenterViewTabsProps) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener("scroll", updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, tabs])

  // Auto-scroll active tab into view
  useEffect(() => {
    const container = scrollContainerRef.current
    const tabList = tabListRef.current
    if (!container || !tabList) return
    const activeButton = tabList.querySelector<HTMLButtonElement>(`[aria-selected="true"]`)
    if (activeButton) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
      }
    }
  }, [activeTab])

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollBy({ left: direction === "left" ? -160 : 160, behavior: "smooth" })
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.key === activeTab)
      if (currentIndex === -1) return

      let nextIndex = -1
      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
      } else if (e.key === "Home") {
        nextIndex = 0
      } else if (e.key === "End") {
        nextIndex = tabs.length - 1
      }

      if (nextIndex >= 0) {
        e.preventDefault()
        onTabChange(tabs[nextIndex].key)
        // Focus the newly active tab button
        const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        buttons?.[nextIndex]?.focus()
      }
    },
    [tabs, activeTab, onTabChange],
  )

  if (tabs.length === 0) return null

  const showScrollButtons = canScrollLeft || canScrollRight

  return (
    <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm px-6 relative">
      {/* Left scroll arrow */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-background/90 border border-border/60 shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          aria-label="Scroll tabs left"
          tabIndex={-1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          ref={tabListRef}
          className="flex items-center gap-1 -mb-px w-max"
          role="tablist"
          aria-label="Content views"
          onKeyDown={handleKeyDown}
        >
          {tabs.map(({ key, label, count, icon: Icon, separated }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                role="tab"
                id={`tab-${key}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium cursor-pointer whitespace-nowrap",
                  "transition-all duration-200 ease-out border-b-2",
                  "active:scale-[0.97] active:transition-transform active:duration-75",
                  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-500",
                  separated && "ml-3",
                  isActive
                    ? "border-violet-600 text-violet-900 dark:border-violet-400 dark:text-violet-100"
                    : "border-transparent text-muted-foreground/70 hover:text-foreground/80 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-200/60 dark:hover:border-violet-800/40",
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 transition-colors duration-200",
                      isActive ? "text-violet-600 dark:text-violet-400" : "",
                    )}
                    aria-hidden="true"
                  />
                )}
                {label}
                {count != null && count > 0 && (
                  <span
                    className={cn(
                      "text-[11px] tabular-nums rounded-full px-1.5 py-0.5 min-w-[20px] text-center transition-all duration-200",
                      isActive
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                        : "bg-muted/80 text-muted-foreground/60",
                    )}
                    aria-label={`${count} ${label.toLowerCase()}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right scroll arrow */}
      {showScrollButtons && canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-background/90 border border-border/60 shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          aria-label="Scroll tabs right"
          tabIndex={-1}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
