"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ListTree, LayoutGrid, PanelTop, Grid2x2, PanelLeftClose, ChevronDown, Columns2 } from "lucide-react"

export type NavMode = "tree" | "category" | "iconCategory" | "topCategory" | "cardCategory" | "tabCategory"

const NAV_MODES: { id: NavMode; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "tree",         label: "Tree",           description: "Single tree navigation",      icon: ListTree },
  { id: "category",     label: "Side tabs",      description: "Vertical tabs with tree",     icon: LayoutGrid },
  { id: "iconCategory", label: "Icon strip",     description: "Compact icon tabs with tree", icon: PanelLeftClose },
  { id: "topCategory",  label: "Top tabs",       description: "Horizontal tabs with tree",   icon: PanelTop },
  { id: "cardCategory", label: "Card grid",      description: "Card grid with tree",         icon: Grid2x2 },
  { id: "tabCategory",  label: "Three tabs",     description: "Knowledge, Sessions, Artefacts", icon: Columns2 },
]

export const NavModeSwitcher = memo(function NavModeSwitcher({
  currentMode,
  onModeChange,
  className,
}: {
  currentMode: NavMode
  onModeChange: (mode: NavMode) => void
  className?: string
}) {
  const current = NAV_MODES.find((m) => m.id === currentMode) ?? NAV_MODES[0]
  const CurrentIcon = current.icon

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-1.5 py-1 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors cursor-pointer",
            className,
          )}
          title="Switch navigation layout"
        >
          <CurrentIcon className="h-3.5 w-3.5" />
          <ChevronDown className="h-2.5 w-2.5 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-44 p-1.5">
        <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Layout</p>
        {NAV_MODES.map((mode) => {
          const Icon = mode.icon
          const isActive = mode.id === currentMode
          return (
            <button
              key={mode.id}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => onModeChange(mode.id)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-xs leading-tight">{mode.label}</span>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
})
